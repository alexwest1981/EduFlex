package com.eduflex.backend.controller;

import com.eduflex.backend.model.Flashcard;
import com.eduflex.backend.model.User;
import com.eduflex.backend.model.UserFlashcardProgress;
import com.eduflex.backend.model.CoachRecommendation;
import com.eduflex.backend.service.SpacedRepetitionService;
import com.eduflex.backend.service.StudyCoachService;
import com.eduflex.backend.service.UserService;
import com.eduflex.backend.repository.FlashcardRepository;
import com.eduflex.backend.repository.CoachRecommendationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/eduai")
public class EduAiController {

    private final SpacedRepetitionService spacedRepetitionService;
    private final StudyCoachService studyCoachService;
    private final UserService userService;
    private final FlashcardRepository flashcardRepository;
    private final CoachRecommendationRepository coachRecommendationRepository;

    public EduAiController(SpacedRepetitionService spacedRepetitionService,
            StudyCoachService studyCoachService,
            UserService userService,
            FlashcardRepository flashcardRepository,
            CoachRecommendationRepository coachRecommendationRepository) {
        this.spacedRepetitionService = spacedRepetitionService;
        this.studyCoachService = studyCoachService;
        this.userService = userService;
        this.flashcardRepository = flashcardRepository;
        this.coachRecommendationRepository = coachRecommendationRepository;
    }

    /**
     * Get cards due for review today for the authenticated user.
     */
    @GetMapping("/review/due")
    public ResponseEntity<List<Flashcard>> getDueCards(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(spacedRepetitionService.getDueCards(user));
    }

    /**
     * Get count of cards due for review.
     */
    @GetMapping("/review/count")
    public ResponseEntity<Map<String, Long>> getDueCount(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(Map.of("count", spacedRepetitionService.getDueCount(user)));
    }

    /**
     * Submit a review result for a single card.
     */
    @PostMapping("/review/submit")
    public ResponseEntity<UserFlashcardProgress> submitReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ReviewRequest request) {

        User user = userService.findByUsername(userDetails.getUsername()).orElseThrow();
        Flashcard card = flashcardRepository.findById(request.getCardId())
                .orElseThrow(() -> new RuntimeException("Card not found"));

        UserFlashcardProgress progress = spacedRepetitionService.updateProgress(user, card, request.getQuality());
        return ResponseEntity.ok(progress);
    }

    /**
     * Get or generate a fresh recommendation from the AI Study Coach.
     */
    @GetMapping("/coach/recommendation")
    public ResponseEntity<CoachRecommendation> getRecommendation(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername()).orElseThrow();

        // Try to find unread active recommendation first
        List<CoachRecommendation> active = studyCoachService.getActiveRecommendations(user);
        if (!active.isEmpty()) {
            return ResponseEntity.ok(active.get(0));
        }

        // Otherwise generate a new one
        return ResponseEntity.ok(studyCoachService.generateRecommendation(user));
    }

    /**
     * Mark a recommendation as read.
     */
    @PostMapping("/coach/read/{id}")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        coachRecommendationRepository.findById(id).ifPresent(rec -> {
            rec.setRead(true);
            coachRecommendationRepository.save(rec);
        });
        return ResponseEntity.ok().build();
    }

    public static class ReviewRequest {
        private Long cardId;
        private int quality;

        public Long getCardId() {
            return cardId;
        }

        public void setCardId(Long cardId) {
            this.cardId = cardId;
        }

        public int getQuality() {
            return quality;
        }

        public void setQuality(int quality) {
            this.quality = quality;
        }
    }
}
