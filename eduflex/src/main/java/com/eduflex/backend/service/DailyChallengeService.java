package com.eduflex.backend.service;

import com.eduflex.backend.model.DailyChallenge;
import com.eduflex.backend.model.UserStreak;
import com.eduflex.backend.repository.DailyChallengeRepository;
import com.eduflex.backend.repository.UserStreakRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DailyChallengeService {

    @Autowired
    private DailyChallengeRepository dailyChallengeRepository;

    @Autowired
    private UserStreakRepository userStreakRepository;

    /**
     * Get today's challenges for a user
     */
    public List<DailyChallenge> getTodaysChallenges(Long userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        List<DailyChallenge> challenges = dailyChallengeRepository
                .findByUserIdAndChallengeDateBetween(userId, startOfDay, endOfDay);

        // If no challenges exist for today, generate them
        if (challenges.isEmpty()) {
            challenges = generateDailyChallenges(userId);
        }

        return challenges;
    }

    /**
     * Generate daily challenges for a user
     */
    @Transactional
    public List<DailyChallenge> generateDailyChallenges(Long userId) {
        List<DailyChallenge> challenges = new ArrayList<>();
        LocalDateTime today = LocalDate.now().atStartOfDay();

        // Challenge 1: Complete assignments
        DailyChallenge assignmentChallenge = new DailyChallenge();
        assignmentChallenge.setUserId(userId);
        assignmentChallenge.setChallengeType("COMPLETE_ASSIGNMENTS");
        assignmentChallenge.setTitle("Slutför 3 uppgifter");
        assignmentChallenge.setDescription("Slutför minst 3 uppgifter idag");
        assignmentChallenge.setTargetValue(3);
        assignmentChallenge.setXpReward(50);
        assignmentChallenge.setChallengeDate(today);
        challenges.add(dailyChallengeRepository.save(assignmentChallenge));

        // Challenge 2: High score
        DailyChallenge scoreChallenge = new DailyChallenge();
        scoreChallenge.setUserId(userId);
        scoreChallenge.setChallengeType("HIGH_SCORE");
        scoreChallenge.setTitle("Få 90%+ på ett quiz");
        scoreChallenge.setDescription("Uppnå minst 90% på något quiz");
        scoreChallenge.setTargetValue(1);
        scoreChallenge.setXpReward(100);
        scoreChallenge.setChallengeDate(today);
        challenges.add(dailyChallengeRepository.save(scoreChallenge));

        // Challenge 3: Login streak
        DailyChallenge streakChallenge = new DailyChallenge();
        streakChallenge.setUserId(userId);
        streakChallenge.setChallengeType("LOGIN_STREAK");
        streakChallenge.setTitle("Logga in 7 dagar i rad");
        streakChallenge.setDescription("Fortsätt din inloggningsstreak");
        streakChallenge.setTargetValue(7);
        streakChallenge.setXpReward(200);
        streakChallenge.setChallengeDate(today);

        // Set current progress based on user's actual streak
        Optional<UserStreak> userStreak = userStreakRepository.findByUserIdAndStreakType(userId, "LOGIN");
        if (userStreak.isPresent()) {
            streakChallenge.setCurrentProgress(userStreak.get().getCurrentStreak());
            if (streakChallenge.getCurrentProgress() >= streakChallenge.getTargetValue()) {
                streakChallenge.setCompleted(true);
                streakChallenge.setCompletedAt(LocalDateTime.now());
            }
        }

        challenges.add(dailyChallengeRepository.save(streakChallenge));

        return challenges;
    }

    /**
     * Update challenge progress
     */
    @Transactional
    public DailyChallenge updateChallengeProgress(Long challengeId, Integer progress) {
        DailyChallenge challenge = dailyChallengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        challenge.setCurrentProgress(progress);
        if (progress >= challenge.getTargetValue() && !challenge.getCompleted()) {
            challenge.setCompleted(true);
            challenge.setCompletedAt(LocalDateTime.now());
        }

        return dailyChallengeRepository.save(challenge);
    }

    /**
     * Increment challenge progress by 1
     */
    @Transactional
    public DailyChallenge incrementChallengeProgress(Long userId, String challengeType) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        List<DailyChallenge> challenges = dailyChallengeRepository
                .findByUserIdAndChallengeDateBetween(userId, startOfDay, endOfDay);

        Optional<DailyChallenge> challenge = challenges.stream()
                .filter(c -> c.getChallengeType().equals(challengeType))
                .findFirst();

        if (challenge.isPresent()) {
            DailyChallenge c = challenge.get();
            c.incrementProgress();
            return dailyChallengeRepository.save(c);
        }

        return null;
    }

    /**
     * Get user's login streak
     */
    public Integer getUserLoginStreak(Long userId) {
        Optional<UserStreak> streak = userStreakRepository.findByUserIdAndStreakType(userId, "LOGIN");
        return streak.map(UserStreak::getCurrentStreak).orElse(0);
    }

    /**
     * Update user's login streak
     */
    @Transactional
    public UserStreak updateLoginStreak(Long userId) {
        Optional<UserStreak> existingStreak = userStreakRepository.findByUserIdAndStreakType(userId, "LOGIN");

        UserStreak streak;
        if (existingStreak.isPresent()) {
            streak = existingStreak.get();
            LocalDate lastActivity = streak.getLastActivityDate();
            LocalDate today = LocalDate.now();

            if (lastActivity != null) {
                long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(lastActivity, today);

                if (daysBetween == 1) {
                    // Consecutive day - increment streak
                    streak.incrementStreak();
                } else if (daysBetween > 1) {
                    // Streak broken - reset
                    streak.resetStreak();
                    streak.incrementStreak();
                }
                // If daysBetween == 0, already logged in today, do nothing
            } else {
                // First time tracking
                streak.incrementStreak();
            }
        } else {
            // Create new streak
            streak = new UserStreak();
            streak.setUserId(userId);
            streak.setStreakType("LOGIN");
            streak.incrementStreak();
        }

        return userStreakRepository.save(streak);
    }
}
