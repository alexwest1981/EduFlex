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

import com.eduflex.backend.model.Achievement;
import com.eduflex.backend.model.UserAchievement;
import com.eduflex.backend.service.AchievementService;
import com.eduflex.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/gamification")
@CrossOrigin(origins = "*")
public class GamificationController {

    private final GamificationService gamificationService;
    private final AchievementService achievementService;
    private final UserRepository userRepository;

    @Autowired
    private DailyChallengeService dailyChallengeService;

    public GamificationController(GamificationService gamificationService, AchievementService achievementService,
            UserRepository userRepository) {
        this.gamificationService = gamificationService;
        this.achievementService = achievementService;
        this.userRepository = userRepository;
    }

    @GetMapping("/badges")
    public List<Badge> getAllBadges() {
        return gamificationService.getAllBadges();
    }

    // === Achievements Endpoints ===

    @GetMapping("/achievements")
    public ResponseEntity<List<Achievement>> getAllAchievements() {
        return ResponseEntity.ok(achievementService.getAllAchievements());
    }

    @GetMapping("/achievements/my")
    public ResponseEntity<List<UserAchievement>> getMyAchievements() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username).orElse(null));

        if (user == null) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.ok(achievementService.getUserAchievements(user.getId()));
    }

    @PostMapping("/init")
    public ResponseEntity<?> init() {
        gamificationService.initBadges();
        return ResponseEntity.ok("Badges created");
    }

    // Endpoint för att manuellt ge poäng (används av lärare eller admin)
    @PostMapping("/award/{userId}")
    public ResponseEntity<User> givePoints(@PathVariable Long userId, @RequestParam int points) {
        return ResponseEntity.ok(gamificationService.addPoints(userId, points));
    }

    // === Daily Challenges Endpoints ===

    @GetMapping("/challenges/daily/{userId}")
    public ResponseEntity<List<DailyChallenge>> getTodaysChallenges(@PathVariable Long userId) {
        List<DailyChallenge> challenges = dailyChallengeService.getTodaysChallenges(userId);
        return ResponseEntity.ok(challenges);
    }

    @GetMapping("/streak/login/{userId}")
    public ResponseEntity<Map<String, Integer>> getLoginStreak(@PathVariable Long userId) {
        Integer streak = dailyChallengeService.getUserLoginStreak(userId);
        return ResponseEntity.ok(Map.of("streak", streak));
    }

    @PostMapping("/streak/login/{userId}")
    public ResponseEntity<?> updateLoginStreak(@PathVariable Long userId) {
        dailyChallengeService.updateLoginStreak(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/challenges/{userId}/increment")
    public ResponseEntity<DailyChallenge> incrementChallenge(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        String challengeType = request.get("challengeType");
        DailyChallenge challenge = dailyChallengeService.incrementChallengeProgress(userId, challengeType);
        return ResponseEntity.ok(challenge);
    }
}
