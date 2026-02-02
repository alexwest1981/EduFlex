package com.eduflex.backend.controller;

import com.eduflex.backend.model.FlashcardDeck;
import com.eduflex.backend.model.User;
import com.eduflex.backend.service.FlashcardService;
import com.eduflex.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {

    private final FlashcardService flashcardService;
    private final UserService userService;

    public FlashcardController(FlashcardService flashcardService, UserService userService) {
        this.flashcardService = flashcardService;
        this.userService = userService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<FlashcardDeck>> getMyDecks(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(flashcardService.getDecksForUser(user.getId()));
    }

    @GetMapping("/deck/{deckId}")
    public ResponseEntity<FlashcardDeck> getDeck(@PathVariable Long deckId) {
        return ResponseEntity.ok(flashcardService.getDeck(deckId));
    }

    @PostMapping("/generate/course/{courseId}")
    public ResponseEntity<?> generateFromCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userService.findByUsername(userDetails.getUsername()).orElseThrow();
        try {
            FlashcardDeck deck = flashcardService.generateDeckFromCourse(courseId, user.getId());
            return ResponseEntity.ok(deck);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/deck/{deckId}/study-session")
    public ResponseEntity<Void> submitStudySession(
            @PathVariable Long deckId,
            @RequestBody List<FlashcardService.CardReviewResult> results) {

        flashcardService.submitStudySession(deckId, results);
        return ResponseEntity.ok().build();
    }
}
