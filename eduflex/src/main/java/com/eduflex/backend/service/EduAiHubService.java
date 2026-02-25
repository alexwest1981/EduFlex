package com.eduflex.backend.service;

import com.eduflex.backend.model.SpacedRepetitionItem;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.SpacedRepetitionRepository;
import com.eduflex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.eduflex.backend.repository.AiSessionResultRepository;
import com.eduflex.backend.model.AiSessionResult;

/**
 * Service for managing the EduAI Hub, including Spaced Repetition logic.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EduAiHubService {

    private final SpacedRepetitionRepository spacedRepetitionRepository;
    private final UserRepository userRepository;
    private final SystemSettingService systemSettingService;
    private final GamificationService gamificationService;
    private final AiCreditService aiCreditService;
    private final AiSessionResultRepository aiSessionResultRepository;

    /**
     * Finds items due for review for a student.
     */
    public List<SpacedRepetitionItem> getDailyReviewQueue(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return spacedRepetitionRepository.findDueItems(user, LocalDateTime.now());
    }

    /**
     * Calculates the overall mastery score for a user.
     * Based on the average of all Radar categories.
     */
    public int getMasteryScore(Long userId) {
        Map<String, Integer> radarStats = getRadarStats(userId);
        if (radarStats.isEmpty())
            return 0;

        double sum = 0.0;
        int count = 0;
        for (Integer score : radarStats.values()) {
            if (score != null) {
                sum += score;
                count++;
            }
        }

        return count == 0 ? 0 : (int) Math.round(sum / count);
    }

    /**
     * Calculates mastery per category for the Radar Chart.
     * Combines data from SpacedRepetitionItem (Queue) and AiSessionResult (Study
     * Sessions).
     */
    public Map<String, Integer> getRadarStats(Long userId) {
        // --- 1. Fetch data from SpacedRepetition (Flashcards/Queue) ---
        List<SpacedRepetitionItem> allSpacedItems = spacedRepetitionRepository.findByUserId(userId);

        // Group items using determineRadarCategory
        Map<String, List<SpacedRepetitionItem>> groupedSpacedItems = allSpacedItems.stream()
                .collect(Collectors.groupingBy(item -> determineRadarCategory(item.getCategory())));

        // --- 2. Fetch data from AiSessionResult (Smart Sessions) ---
        List<AiSessionResult> allSessionItems = aiSessionResultRepository.findByUserId(userId);

        Map<String, Integer> stats = new HashMap<>();
        String[] categories = { "Teori", "Praktik", "Focus", "Analys" };

        for (String cat : categories) {
            double totalScore = 0.0;
            int count = 0;

            // 1. Calculate average from Spaced Repetition (if any exists for this category)
            List<SpacedRepetitionItem> sItems = groupedSpacedItems.get(cat);
            if (sItems != null && !sItems.isEmpty()) {
                double avg = sItems.stream()
                        .mapToDouble(item -> Math.min(1.0, (item.getEasinessFactor() - 1.3) / 1.2))
                        .average()
                        .orElse(0.0);
                totalScore += avg;
                count++;
            }

            // 2. Calculate average from AiSessionResults mapped to this category
            double sessionTotal = 0.0;
            int sessionCount = 0;
            for (AiSessionResult session : allSessionItems) {
                String sessionCat = determineRadarCategory(session.getSessionType());

                if (cat.equals(sessionCat) && session.getMaxScore() > 0) {
                    sessionTotal += (double) session.getScore() / session.getMaxScore();
                    sessionCount++;
                }
            }

            if (sessionCount > 0) {
                totalScore += (sessionTotal / sessionCount);
                count++;
            }

            // Final Average
            if (count == 0) {
                stats.put(cat, 0);
            } else {
                stats.put(cat, (int) Math.round((totalScore / count) * 100));
            }
        }
        return stats;
    }

    /**
     * Helper to map various source types/categories to the 4 main Radar segments.
     */
    private String determineRadarCategory(String category) {
        if (category == null)
            return "Teori";
        String cat = category.toUpperCase();

        return switch (cat) {
            case "QUIZ", "LESSON", "SUMMARY", "TEORI" -> "Teori";
            case "PRACTICE", "PRAKTIK", "LAB" -> "Praktik";
            case "EXAM_PREP", "ANALYS", "EXAM" -> "Analys";
            case "FOCUS", "TIME_ATTACK", "STREAK" -> "Focus";
            default -> "Teori";
        };
    }

    /**
     * Processes the result of a review session using the SM-2 algorithm.
     * 
     * @param itemId  The ID of the item reviewed.
     * @param quality Quality of response (0-5). 0=forgot, 5=perfect.
     */
    @Transactional
    public SpacedRepetitionItem processReviewResult(Long itemId, int quality) {
        SpacedRepetitionItem item = spacedRepetitionRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // SM-2 Algorithm Implementation
        int repetitions = item.getRepetitions();
        double ef = item.getEasinessFactor();
        int interval = item.getInterval();

        if (quality >= 3) {
            // Success
            if (repetitions == 0) {
                interval = 1;
            } else if (repetitions == 1) {
                interval = 6;
            } else {
                interval = (int) Math.round(interval * ef);
            }
            repetitions++;
        } else {
            // Failure
            repetitions = 0;
            interval = 1;
        }

        // Adjust Easiness Factor: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
        ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (ef < 1.3)
            ef = 1.3;

        item.setRepetitions(repetitions);
        item.setEasinessFactor(ef);
        item.setInterval(interval);
        item.setLastReviewed(LocalDateTime.now());
        item.setNextReviewDate(LocalDateTime.now().plusDays(interval));

        SpacedRepetitionItem saved = spacedRepetitionRepository.save(item);

        // Reward Gamification
        if (quality >= 3) {
            rewardStudent(item.getUser(), quality);
        }

        return saved;
    }

    private void rewardStudent(User user, int quality) {
        // Fetch XP Ratio from settings
        String xpRatioStr = systemSettingService.getSetting("eduai_xp_ratio") != null
                ? systemSettingService.getSetting("eduai_xp_ratio").getSettingValue()
                : "1.0";
        double ratio = Double.parseDouble(xpRatioStr);

        int baseXP = quality * 10;
        int finalXP = (int) (baseXP * ratio);

        gamificationService.addPoints(user.getId(), finalXP);

        // AI Credits: Award based on quality if quality is high (4 or 5)
        String earnRateStr = systemSettingService.getSetting("eduai_credit_earn_rate") != null
                ? systemSettingService.getSetting("eduai_credit_earn_rate").getSettingValue()
                : "5";
        int earnRate = Integer.parseInt(earnRateStr);

        if (quality >= 4) {
            int creditReward = (quality == 5) ? earnRate : (int) Math.ceil(earnRate / 2.0);
            aiCreditService.awardCredits(user, creditReward, "Daily Review - Intelligence Contribution");
        }
    }

    /**
     * Adds a new knowledge fragment to the student's queue.
     */
    @Transactional
    public void addKnowledgeFragment(User user, String title, String content, String category, Long sourceId) {
        // Check if already exists to avoid duplicates
        List<SpacedRepetitionItem> existing = spacedRepetitionRepository
                .findByUserIdAndCategoryAndSourceId(user.getId(), category, sourceId);
        if (!existing.isEmpty())
            return;

        SpacedRepetitionItem item = SpacedRepetitionItem.builder()
                .user(user)
                .title(title)
                .content(content)
                .category(category)
                .sourceId(sourceId)
                .repetitions(0)
                .easinessFactor(2.5)
                .interval(0)
                .nextReviewDate(LocalDateTime.now()) // Due immediately
                .build();

        spacedRepetitionRepository.save(item);
    }
}
