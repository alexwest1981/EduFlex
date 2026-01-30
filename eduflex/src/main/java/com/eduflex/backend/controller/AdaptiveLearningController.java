package com.eduflex.backend.controller;

import com.eduflex.backend.model.StudentRecommendation;
import com.eduflex.backend.repository.StudentRecommendationRepository;
import com.eduflex.backend.service.AdaptiveLearningService;
import com.eduflex.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/adaptive-learning")
public class AdaptiveLearningController {

    private final AdaptiveLearningService adaptiveLearningService;
    private final StudentRecommendationRepository recommendationRepository;
    private final UserService userService;

    public AdaptiveLearningController(AdaptiveLearningService adaptiveLearningService,
            StudentRecommendationRepository recommendationRepository,
            UserService userService) {
        this.adaptiveLearningService = adaptiveLearningService;
        this.recommendationRepository = recommendationRepository;
        this.userService = userService;
    }

    @GetMapping("/recommendations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StudentRecommendation>> getMyRecommendations() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        // Since we don't have a direct getCurrentUser(), we fetch by username
        // We use a safe method or try-catch if needed, but assuming authenticated user
        // exists.
        // getUserByUsernameWithBadges is a bit heavy but works. Or use a repository
        // find.
        // Let's assume we can use repository directly or userService if it had
        // findByUsername.
        // UserService has getUserByUsernameWithBadges.
        com.eduflex.backend.model.User user = userService.getUserByUsernameWithBadges(username);

        return ResponseEntity.ok(recommendationRepository.findByUserIdAndIsViewedFalse(user.getId()));
    }

    @PutMapping("/recommendations/{id}/view")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAsViewed(@PathVariable Long id) {
        Optional<StudentRecommendation> rec = recommendationRepository.findById(id);
        if (rec.isPresent()) {
            StudentRecommendation recommendation = rec.get();

            String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getName();
            com.eduflex.backend.model.User currentUser = userService.getUserByUsernameWithBadges(username);

            // Verify ownership
            if (!recommendation.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).build();
            }
            recommendation.setViewed(true);
            recommendationRepository.save(recommendation);
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/trigger")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<String> triggerAnalysis() {
        adaptiveLearningService.triggerManualAnalysis();
        return ResponseEntity.ok("Analysis triggered successfully");
    }
}
