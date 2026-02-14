package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "adaptive_recommendations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdaptiveRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private RecommendationType type;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String aiReasoning; // "Why this was recommended?"

    // Links to content (nullable, as recommendation might be generic "Rest more")
    private Long courseId;
    private Long lessonId;
    private Long assignmentId;

    // External link or internal route
    private String actionUrl;
    private String actionLabel;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "priority_score")
    private Integer priorityScore; // 1-100, for sorting

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    public enum RecommendationType {
        REVIEW_TOPIC, // e.g. "Review Algebra Basics"
        CHALLENGE_YOURSELF, // e.g. "Try Advanced Quiz"
        WELLBEING_CHECK, // e.g. "Take a break"
        PEER_SUPPORT, // e.g. "Ask a friend"
        CONTENT_CONSUMPTION // e.g. "Watch this video"
    }

    public enum Status {
        PENDING,
        ACCEPTED,
        COMPLETED,
        DISMISSED,
        EXPIRED
    }
}
