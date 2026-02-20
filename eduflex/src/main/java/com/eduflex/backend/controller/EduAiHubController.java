package com.eduflex.backend.controller;

import com.eduflex.backend.model.SpacedRepetitionItem;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.EduAiHubService;
import com.eduflex.backend.service.SystemSettingService;
import com.eduflex.backend.service.AiCreditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final AiCreditService aiCreditService;

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
        stats.put("aiCredits", aiCreditService.getBalance(user));

        // NEW: Live Data from DB
        stats.put("masteryScore", eduAiHubService.getMasteryScore(user.getId()));
        stats.put("radarStats", eduAiHubService.getRadarStats(user.getId()));

        return ResponseEntity.ok(stats);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
