package com.eduflex.backend.controller;

import com.eduflex.backend.model.SpacedRepetitionItem;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.EduAiHubService;
import com.eduflex.backend.service.GamificationService;
import com.eduflex.backend.service.SystemSettingService;
import com.eduflex.backend.service.ai.EduAIService;
import com.eduflex.backend.service.ai.EduAiRecommendationService;
import lombok.RequiredArgsConstructor;
import com.eduflex.backend.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/hub")
@RequiredArgsConstructor
public class EduAiHubController {

    private final EduAiHubService eduAiHubService;
    private final UserRepository userRepository;
    private final SystemSettingService systemSettingService;
    private final EduAIService eduAIService;
    private final GamificationService gamificationService;
    private final EduAiRecommendationService eduAiRecommendationService;

    @GetMapping("/queue")
    public ResponseEntity<List<SpacedRepetitionItem>> getReviewQueue() {
        User user = getCurrentUser();
        return ResponseEntity.ok(eduAiHubService.getDailyReviewQueue(user.getId()));
    }

    @PostMapping("/review/{itemId}")
    public ResponseEntity<SpacedRepetitionItem> processReview(
            @PathVariable Long itemId,
            @RequestParam int quality) {
        return ResponseEntity.ok(eduAiHubService.processReviewResult(itemId, quality));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getHubStats() {
        User user = getCurrentUser();
        List<SpacedRepetitionItem> queue = eduAiHubService.getDailyReviewQueue(user.getId());

        Map<String, Object> stats = new HashMap<>();
        stats.put("queueSize", queue.size());
        stats.put("xpMultiplier", systemSettingService.getSetting("eduai_xp_ratio") != null
                ? systemSettingService.getSetting("eduai_xp_ratio").getSettingValue()
                : "1.0");
        stats.put("totalXp", user.getPoints());

        // NEW: Live Data from DB
        stats.put("masteryScore", eduAiHubService.getMasteryScore(user.getId()));
        stats.put("radarStats", eduAiHubService.getRadarStats(user.getId()));

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<EduAiRecommendationService.Recommendation>> getRecommendations() {
        User user = getCurrentUser();
        return ResponseEntity.ok(eduAiRecommendationService.getRecommendations(user.getId()));
    }

    @PostMapping("/session/generate")
    public ResponseEntity<Map<String, Object>> generateSession(@RequestBody Map<String, Object> request) {
        User user = getCurrentUser();
        Long courseId = null;
        if (request.get("courseId") != null) {
            courseId = Long.parseLong(request.get("courseId").toString());
        }
        String sessionType = (String) request.get("sessionType");
        if (sessionType == null)
            sessionType = "SUMMARY";

        return ResponseEntity.ok(eduAIService.generateStudySession(user.getId(), courseId, sessionType));
    }

    @PostMapping("/session/complete")
    public ResponseEntity<Map<String, Object>> completeSession(@RequestBody Map<String, Object> request,
            @RequestParam int xp) {
        User user = getCurrentUser();

        Long courseId = null;
        if (request.get("courseId") != null) {
            courseId = Long.parseLong(request.get("courseId").toString());
        }
        String sessionType = (String) request.get("sessionType");
        if (sessionType == null)
            sessionType = "SUMMARY";

        Integer score = request.get("score") != null ? Integer.parseInt(request.get("score").toString()) : 0;
        Integer maxScore = request.get("maxScore") != null ? Integer.parseInt(request.get("maxScore").toString()) : 0;

        Map<String, Object> improvementData = eduAIService.saveSessionResultAndGetImprovement(user, courseId,
                sessionType, score, maxScore);

        gamificationService.addPoints(user.getId(), xp);

        return ResponseEntity.ok(improvementData);
    }

    private User getCurrentUser() {
        return SecurityUtils.getCurrentUser(userRepository);
    }
}
