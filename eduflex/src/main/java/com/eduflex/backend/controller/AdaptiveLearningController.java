package com.eduflex.backend.controller;

import com.eduflex.backend.dto.AdaptiveDashboardDTO;
import com.eduflex.backend.model.User;
import com.eduflex.backend.service.AdaptiveLearningService;
import com.eduflex.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/adaptive")
@RequiredArgsConstructor
public class AdaptiveLearningController {

    private final AdaptiveLearningService adaptiveLearningService;
    private final UserService userService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN', 'ROLE_STUDENT', 'ROLE_ADMIN')")
    public ResponseEntity<AdaptiveDashboardDTO> getDashboard(Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        return ResponseEntity.ok(adaptiveLearningService.getStudentDashboard(user.getId()));
    }

    @PostMapping("/analyze")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN', 'ROLE_STUDENT', 'ROLE_ADMIN')")
    public ResponseEntity<Void> triggerAnalysis(Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        adaptiveLearningService.analyzeStudentPerformance(user.getId());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/recommendations/{id}/status")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN', 'ROLE_STUDENT', 'ROLE_ADMIN')")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body,
            Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        String statusStr = body.get("status");
        try {
            com.eduflex.backend.model.AdaptiveRecommendation.Status status = com.eduflex.backend.model.AdaptiveRecommendation.Status
                    .valueOf(statusStr);
            adaptiveLearningService.updateRecommendationStatus(id, status, user.getId());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
