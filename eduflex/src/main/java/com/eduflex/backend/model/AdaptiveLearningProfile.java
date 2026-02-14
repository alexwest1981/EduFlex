package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "adaptive_learning_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdaptiveLearningProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    private LearningStyle primaryLearningStyle; // VISUAL, AUDITORY, READING, KINESTHETIC

    @Column(name = "average_pace_multiplier")
    private Double averagePaceMultiplier; // 1.0 = standard, <1.0 = fast, >1.0 = needs more time

    @ElementCollection
    @CollectionTable(name = "adaptive_profile_struggles", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "topic")
    private List<String> struggleAreas; // e.g., "Math: Algebra", "History: Dates"

    @ElementCollection
    @CollectionTable(name = "adaptive_profile_strengths", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "topic")
    private List<String> strengthAreas;

    @Column(columnDefinition = "TEXT")
    private String aiAnalysisSummary; // Summary from Gemini regarding the student's pattern

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum LearningStyle {
        VISUAL,
        AUDITORY,
        READING_WRITING,
        KINESTHETIC,
        MIXED
    }
}
