package com.eduflex.backend.controller;

import com.eduflex.backend.model.AdaptiveRecommendation;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.AdaptiveLearningService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import com.eduflex.backend.dto.AdaptiveDashboardDTO;

@RestController
@RequestMapping("/api/adaptive")
public class AdaptiveLearningController {

    private final AdaptiveLearningService adaptiveLearningService;
    private final UserRepository userRepository;

    public AdaptiveLearningController(AdaptiveLearningService adaptiveLearningService,
            UserRepository userRepository) {
        this.adaptiveLearningService = adaptiveLearningService;
        this.userRepository = userRepository;
    }

    @PostMapping("/analyze")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN', 'ROLE_STUDENT', 'ROLE_ADMIN')")
    public ResponseEntity<Void> analyzeProgress(@RequestBody Map<String, Long> body) {
        Long studentId = body.get("studentId");
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        adaptiveLearningService.generateLearningPath(student);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/recommendation/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN', 'ROLE_STUDENT', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> getRecommendation(@PathVariable Long id, @RequestParam Long studentId) {
        String text = adaptiveLearningService.getRecommendationText(id, studentId);
        return ResponseEntity.ok(Map.of("recommendation", text));
    }

    @PatchMapping("/recommendations/{id}/status")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN', 'ROLE_STUDENT', 'ROLE_ADMIN')")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body,
            @RequestParam Long studentId) {
        AdaptiveRecommendation.Status status = AdaptiveRecommendation.Status.valueOf(body.get("status"));
        adaptiveLearningService.updateRecommendationStatus(id, status, studentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN', 'ROLE_STUDENT', 'ROLE_ADMIN')")
    public ResponseEntity<AdaptiveDashboardDTO> getDashboard() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(adaptiveLearningService.getStudentDashboard(currentUser.getId()));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
