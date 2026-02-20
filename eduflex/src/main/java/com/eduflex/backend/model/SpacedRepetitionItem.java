package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing a "knowledge fragment" tracked for Spaced Repetition.
 * Implements core fields for the SM-2 algorithm.
 */
@Entity
@Table(name = "spaced_repetition_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpacedRepetitionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title; // Short name for the fragment

    @Column(columnDefinition = "TEXT")
    private String content; // The actual content/question/fact

    @Column(nullable = false)
    private String category; // e.g., "QUIZ_QUESTION", "VOCABULARY", "CONCEPT"

    private Long sourceId; // e.g., Question ID or Lesson ID

    // SM-2 Algorithm Fields
    @Builder.Default
    private int repetitions = 0; // Number of successful repetitions

    @Builder.Default
    private double easinessFactor = 2.5; // "E-Factor"

    @Builder.Default
    private int interval = 0; // Interval in days

    private LocalDateTime lastReviewed;
    private LocalDateTime nextReviewDate;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.nextReviewDate == null) {
            this.nextReviewDate = LocalDateTime.now();
        }
    }
}
