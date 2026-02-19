package com.eduflex.backend.controller;

import com.eduflex.backend.model.Badge;
import com.eduflex.backend.model.DailyChallenge;
import com.eduflex.backend.model.User;
import com.eduflex.backend.service.GamificationService;
import com.eduflex.backend.service.DailyChallengeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import com.eduflex.backend.model.UserStreak;
import com.eduflex.backend.service.UserStreakService;

import com.eduflex.backend.model.Achievement;
import com.eduflex.backend.model.UserAchievement;
import com.eduflex.backend.service.AchievementService;
import com.eduflex.backend.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/gamification")
@CrossOrigin(origins = "*")
@org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
public class GamificationController {

    private static final Logger logger = LoggerFactory.getLogger(GamificationController.class);

    private final GamificationService gamificationService;
    private final AchievementService achievementService;
    private final UserRepository userRepository;
    private final UserStreakService userStreakService;

    @Autowired
    private DailyChallengeService dailyChallengeService;

    public GamificationController(GamificationService gamificationService, AchievementService achievementService,
            UserRepository userRepository, UserStreakService userStreakService) {
        this.gamificationService = gamificationService;
        this.achievementService = achievementService;
        this.userRepository = userRepository;
        this.userStreakService = userStreakService;
    }

    @GetMapping("/badges")
    public List<Badge> getAllBadges() {
        return gamificationService.getAllBadges();
    }

    @GetMapping("/achievements")
    public ResponseEntity<List<Achievement>> getAllAchievements() {
        return ResponseEntity.ok(achievementService.getAllAchievements());
    }

    @GetMapping("/points/my")
    public ResponseEntity<Integer> getMyPoints() {
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return ResponseEntity.status(401).build();
            }

            String username = auth.getName();
            User user = userRepository.findByUsername(username)
                    .orElseGet(() -> userRepository.findByEmail(username).orElse(null));

            if (user == null) {
                return ResponseEntity.status(404).build();
            }

            return ResponseEntity.ok(user.getPoints());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/achievements/my")
    public ResponseEntity<List<UserAchievement>> getMyAchievements() {
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return ResponseEntity.status(401).build();
            }

            String username = auth.getName();
            User user = userRepository.findByUsername(username)
                    .orElseGet(() -> userRepository.findByEmail(username).orElse(null));

            if (user == null) {
                return ResponseEntity.status(404).build();
            }

            return ResponseEntity.ok(achievementService.getUserAchievements(user.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/init")
    public ResponseEntity<?> init() {
        gamificationService.initBadges();
        return ResponseEntity.ok("Badges created");
    }

    @PostMapping("/award/{userId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<User> givePoints(@PathVariable Long userId, @RequestParam int points) {
        return ResponseEntity.ok(gamificationService.addPoints(userId, points));
    }

    @PostMapping("/xp/award")
    public ResponseEntity<User> awardXp(@RequestBody Map<String, Object> request) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username).orElseThrow());

        int amount = (int) request.getOrDefault("amount", 0);
        String source = (String) request.getOrDefault("source", "UNKNOWN");

        if (amount > 200)
            amount = 200;

        logger.info("Awarding {} XP to user {} from source {}", amount, user.getId(), source);
        return ResponseEntity.ok(gamificationService.addPoints(user.getId(), amount));
    }

    @GetMapping("/challenges/daily/{userId}")
    public ResponseEntity<List<DailyChallenge>> getTodaysChallenges(@PathVariable Long userId) {
        return ResponseEntity.ok(dailyChallengeService.getTodaysChallenges(userId));
    }

    @GetMapping("/streak")
    public ResponseEntity<Map<String, Object>> getMyStreak() {
        try {
            String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseGet(() -> userRepository.findByEmail(username).orElse(null));

            if (user == null) {
                return ResponseEntity.status(404).build();
            }

            Integer streak = userStreakService.getStreak(user.getId(), "LOGIN")
                    .map(UserStreak::getCurrentStreak)
                    .orElse(0);

            return ResponseEntity.ok(Map.of("streak", streak, "userId", user.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/streak/login/{userId}")
    public ResponseEntity<Map<String, Integer>> getLoginStreak(@PathVariable Long userId) {
        Integer streak = userStreakService.getStreak(userId, "LOGIN")
                .map(UserStreak::getCurrentStreak)
                .orElse(0);
        return ResponseEntity.ok(Map.of("streak", streak));
    }

    @PostMapping("/streak/login/{userId}")
    public ResponseEntity<?> updateLoginStreak(@PathVariable Long userId) {
        userStreakService.updateLoginStreak(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/challenges/{userId}/increment")
    public ResponseEntity<DailyChallenge> incrementChallenge(@PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        String challengeType = request.get("challengeType");
        return ResponseEntity.ok(dailyChallengeService.incrementChallengeProgress(userId, challengeType));
    }

    @PostMapping("/achievements/recalculate-xp")
    public ResponseEntity<Map<String, Object>> recalculateMyXp() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username).orElse(null));

        if (user == null)
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));

        int totalXp = achievementService.recalculateUserXp(user.getId());
        int newLevel = (totalXp / 100) + 1;

        return ResponseEntity.ok(Map.of("success", true, "totalXp", totalXp, "level", newLevel));
    }

    @Autowired
    private com.eduflex.backend.service.ai.EduAIService eduAIService;

    @PostMapping("/eduai/generate")
    public ResponseEntity<List<com.eduflex.backend.model.EduAIQuest>> generateEduAIQuests() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username).orElseThrow());

        return ResponseEntity.ok(eduAIService.generateQuests(user.getId()));
    }

    @GetMapping("/eduai/active")
    public ResponseEntity<List<com.eduflex.backend.model.EduAIQuest>> getActiveEduAIQuests() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username).orElseThrow());

        return ResponseEntity.ok(eduAIService.getActiveQuests(user.getId()));
    }

    @PostMapping("/eduai/complete/{questId}")
    public ResponseEntity<com.eduflex.backend.model.EduAIQuest> completeQuest(@PathVariable Long questId) {
        com.eduflex.backend.model.EduAIQuest quest = eduAIService.completeQuest(questId);
        gamificationService.addPoints(quest.getUserId(), quest.getRewardXp());
        return ResponseEntity.ok(quest);
    }
}
