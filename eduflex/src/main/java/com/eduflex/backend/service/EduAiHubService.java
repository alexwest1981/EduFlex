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
import java.util.List;

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

    /**
     * Finds items due for review for a student.
     */
    public List<SpacedRepetitionItem> getDailyReviewQueue(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return spacedRepetitionRepository.findDueItems(user, LocalDateTime.now());
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
