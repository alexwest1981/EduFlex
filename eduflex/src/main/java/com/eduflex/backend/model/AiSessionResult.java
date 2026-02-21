package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_session_results")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiSessionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "course_id")
    private Long courseId; // Nullable om allmänt

    @Column(name = "session_type", nullable = false)
    private String sessionType; // t.ex. SUMMARY, PRACTICE, EXAM_PREP

    @Column(nullable = false)
    private Integer score;

    @Column(name = "max_score", nullable = false)
    private Integer maxScore;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
