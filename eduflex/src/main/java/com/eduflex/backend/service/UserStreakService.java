package com.eduflex.backend.service;

import com.eduflex.backend.model.UserStreak;
import com.eduflex.backend.repository.UserStreakRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class UserStreakService {

    private static final Logger logger = LoggerFactory.getLogger(UserStreakService.class);

    private final UserStreakRepository userStreakRepository;
    private final GamificationService gamificationService;

    public UserStreakService(UserStreakRepository userStreakRepository, GamificationService gamificationService) {
        this.userStreakRepository = userStreakRepository;
        this.gamificationService = gamificationService;
    }

    /**
     * Updates the login streak for a user.
     * Should be called upon successful login.
     */
    @Transactional
    public UserStreak updateLoginStreak(Long userId) {
        Optional<UserStreak> existingStreak = userStreakRepository.findByUserIdAndStreakType(userId, "LOGIN");
        UserStreak streak;
        LocalDate today = LocalDate.now();

        if (existingStreak.isPresent()) {
            streak = existingStreak.get();
            LocalDate lastActivity = streak.getLastActivityDate();

            if (lastActivity != null) {
                long daysBetween = ChronoUnit.DAYS.between(lastActivity, today);

                if (daysBetween == 1) {
                    // Consecutive day
                    streak.incrementStreak();
                    checkStreakMilestones(userId, streak.getCurrentStreak());
                    logger.info("User {} streak incremented to {}", userId, streak.getCurrentStreak());
                } else if (daysBetween > 1) {
                    // Streak broken
                    if (streak.getFreezesAvailable() != null && streak.getFreezesAvailable() > 0) {
                        streak.useFreeze();
                        logger.info("User {} used streak freeze. Current streak: {}", userId,
                                streak.getCurrentStreak());
                    } else {
                        streak.resetStreak();
                        streak.incrementStreak();
                        logger.info("User {} streak reset and restarted. Current: 1", userId);
                    }
                }
                // If daysBetween == 0, already tracked today, do nothing
            } else {
                streak.incrementStreak();
            }
        } else {
            streak = new UserStreak();
            streak.setUserId(userId);
            streak.setStreakType("LOGIN");
            streak.setCurrentStreak(1);
            streak.setLongestStreak(1);
            streak.setLastActivityDate(today);
            logger.info("User {} started a new login streak", userId);
        }

        return userStreakRepository.save(streak);
    }

    private void checkStreakMilestones(Long userId, int streakCount) {
        // Award points based on milestones
        if (streakCount == 3) {
            gamificationService.addPoints(userId, 50); // 3-day bonus
        } else if (streakCount == 7) {
            gamificationService.addPoints(userId, 150); // Weekly bonus
        } else if (streakCount == 30) {
            gamificationService.addPoints(userId, 1000); // Monthly mega bonus
        } else if (streakCount > 0 && streakCount % 10 == 0) {
            gamificationService.addPoints(userId, 100); // Every 10 days
        }
    }

    public Optional<UserStreak> getStreak(Long userId, String type) {
        return userStreakRepository.findByUserIdAndStreakType(userId, type);
    }
}
