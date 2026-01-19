package com.eduflex.backend.service;

import com.eduflex.backend.model.Achievement;
import com.eduflex.backend.model.User;
import com.eduflex.backend.model.UserAchievement;
import com.eduflex.backend.repository.AchievementRepository;
import com.eduflex.backend.repository.UserAchievementRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final UserRepository userRepository;

    public AchievementService(AchievementRepository achievementRepository,
            UserAchievementRepository userAchievementRepository,
            UserRepository userRepository) {
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.userRepository = userRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedDefaultAchievements() {
        // --- EXPLORATION & ACTIVITY ---
        createAchievement("First Login", "Logga in för första gången.", "✨", "COMMON", "EXPLORATION", 50,
                "login_count >= 1");
        createAchievement("Night Owl", "Logga in sent (efter 22:00).", "🌙", "RARE", "EXPLORATION", 150,
                "login_hour >= 22");
        createAchievement("Early Bird", "Logga in tidigt (före 07:00).", "🌅", "RARE", "EXPLORATION", 150,
                "login_hour <= 7");
        createAchievement("Marathon Runner", "Logga in 50 gånger.", "🏃", "EPIC", "CONSISTENCY", 500,
                "login_count >= 50");
        createAchievement("Centurion", "Logga in 100 gånger.", "💯", "LEGENDARY", "CONSISTENCY", 1000,
                "login_count >= 100");

        // --- ACADEMIC ---
        createAchievement("Scholar", "Lämna in din första uppgift.", "📝", "COMMON", "ACADEMIC", 50,
                "submission_count >= 1");
        createAchievement("Assignment Master", "Lämna in 5 uppgifter.", "📚", "RARE", "ACADEMIC", 200,
                "submission_count >= 5");
        createAchievement("Grade Hunter", "Lämna in 20 uppgifter.", "🎓", "EPIC", "ACADEMIC", 500,
                "submission_count >= 20");

        // --- SOCIAL ---
        createAchievement("Social Butterfly", "Lägga till en vän.", "👋", "COMMON", "SOCIAL", 50,
                "friend_count >= 1");
        createAchievement("Networker", "Ha 5 vänner.", "🤝", "RARE", "SOCIAL", 200, "friend_count >= 5");
        createAchievement("Community Pillar", "Ha 20 vänner.", "mjau", "EPIC", "SOCIAL", 1000,
                "friend_count >= 20");

        // --- PROFILE ---
        createAchievement("Profile Perfector", "Ladda upp en profilbild.", "🖼️", "COMMON", "IDENTITY", 100,
                "has_avatar >= 1");
        createAchievement("Identity Established", "Fyll i din bio/settings.", "✍️", "COMMON", "IDENTITY", 50,
                "profile_filled >= 1");

        // --- SPECIAL ---
        createAchievement("Streak Keeper", "Håll en streak på 7 dagar.", "🔥", "EPIC", "CONSISTENCY", 500,
                "streak_days >= 7");
        createAchievement("Unstoppable", "Håll en streak på 30 dagar.", "🚀", "LEGENDARY", "CONSISTENCY", 2000,
                "streak_days >= 30");
    }

    private void createAchievement(String name, String description, String icon, String tier, String category, int xp,
            String criteria) {
        if (achievementRepository.findByName(name).isPresent()) {
            return; // Already exists
        }
        Achievement a = new Achievement();
        a.setName(name);
        a.setDescription(description);
        a.setIconUrl(icon); // Using emoji as icon for now, or use URL path
        a.setTier(tier);
        a.setCategory(category);
        a.setXpReward(xp);
        a.setUnlockCriteria(criteria);
        a.setIsActive(true);
        achievementRepository.save(a);
    }

    public List<Achievement> getAllAchievements() {
        return achievementRepository.findByIsActiveTrue();
    }

    public List<UserAchievement> getUserAchievements(Long userId) {
        return userAchievementRepository.findByUserId(userId);
    }

    @Transactional
    public void checkAndUnlock(Long userId, String criteriaType, int value) {
        // This is a simplified rule engine. In production, parsing the criteria
        // JSON/String properly is better.
        // For MVP, we pass explicit triggers.

        List<Achievement> allAchievements = achievementRepository.findByIsActiveTrue();

        for (Achievement achievement : allAchievements) {
            // Check if user already has it unlocked
            Optional<UserAchievement> existing = userAchievementRepository.findByUserIdAndAchievementId(userId,
                    achievement.getId());
            if (existing.isPresent() && existing.get().getUnlocked()) {
                continue;
            }

            boolean shouldUnlock = false;
            String rule = achievement.getUnlockCriteria();

            // Simple parsing of rule "login_count >= 1"
            // Simple parsing of rule "login_count >= 1", "login_hour <= 7"
            if (rule != null && rule.startsWith(criteriaType)) {
                try {
                    // Supported operators: >=, <=, ==
                    if (rule.contains(">=")) {
                        String[] parts = rule.split(">=");
                        int target = Integer.parseInt(parts[1].trim());
                        if (value >= target)
                            shouldUnlock = true;
                    } else if (rule.contains("<=")) {
                        String[] parts = rule.split("<=");
                        int target = Integer.parseInt(parts[1].trim());
                        if (value <= target)
                            shouldUnlock = true;
                    } else if (rule.contains("==")) {
                        String[] parts = rule.split("==");
                        int target = Integer.parseInt(parts[1].trim());
                        if (value == target)
                            shouldUnlock = true;
                    }
                } catch (Exception e) {
                    // ignore parse error
                    // System.err.println("Error parsing criteria: " + rule);
                }
            }

            if (shouldUnlock) {
                unlockAchievement(userId, achievement);
            }
        }
    }

    private void unlockAchievement(Long userId, Achievement achievement) {
        UserAchievement ua = userAchievementRepository.findByUserIdAndAchievementId(userId, achievement.getId())
                .orElse(new UserAchievement());

        if (ua.getId() == null) {
            ua.setUserId(userId);
            ua.setAchievementId(achievement.getId());
        }

        if (!ua.getUnlocked()) {
            ua.unlock();
            userAchievementRepository.save(ua);

            // Award XP for unlocking achievement
            awardXpForAchievement(userId, achievement.getXpReward());
        }
    }

    private void awardXpForAchievement(Long userId, int xpReward) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || xpReward <= 0) return;

        user.setPoints(user.getPoints() + xpReward);

        // Level up logic: every 100 XP = 1 level
        int newLevel = (user.getPoints() / 100) + 1;
        if (newLevel > user.getLevel()) {
            user.setLevel(newLevel);
        }

        userRepository.save(user);
    }

    /**
     * Retroactively awards XP for all unlocked achievements that haven't been
     * credited yet.
     * This is useful for users who unlocked achievements before XP rewards were
     * implemented.
     */
    @Transactional
    public int recalculateUserXp(Long userId) {
        List<UserAchievement> userAchievements = userAchievementRepository.findByUserId(userId);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null)
            return 0;

        int totalXp = 0;
        for (UserAchievement ua : userAchievements) {
            if (ua.getUnlocked()) {
                Achievement achievement = achievementRepository.findById(ua.getAchievementId()).orElse(null);
                if (achievement != null) {
                    totalXp += achievement.getXpReward();
                }
            }
        }

        // Set the user's points to the calculated total
        user.setPoints(totalXp);

        // Recalculate level
        int newLevel = (totalXp / 100) + 1;
        user.setLevel(newLevel);

        userRepository.save(user);
        return totalXp;
    }

    /**
     * Recalculates XP for all users in the system.
     * Admin-only operation.
     */
    @Transactional
    public int recalculateAllUsersXp() {
        List<User> allUsers = userRepository.findAll();
        int totalUpdated = 0;
        for (User user : allUsers) {
            int xp = recalculateUserXp(user.getId());
            if (xp > 0)
                totalUpdated++;
        }
        return totalUpdated;
    }
}
