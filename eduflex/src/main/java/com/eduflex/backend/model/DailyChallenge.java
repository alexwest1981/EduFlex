package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_challenges")
@Data
public class DailyChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "challenge_type", nullable = false)
    private String challengeType; // COMPLETE_ASSIGNMENTS, HIGH_SCORE, LOGIN_STREAK, etc.

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "target_value", nullable = false)
    private Integer targetValue;

    @Column(name = "current_progress", nullable = false)
    private Integer currentProgress = 0;

    @Column(name = "xp_reward", nullable = false)
    private Integer xpReward;

    @Column(name = "completed", nullable = false)
    private Boolean completed = false;

    @Column(name = "challenge_date", nullable = false)
    private LocalDateTime challengeDate;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public void incrementProgress() {
        this.currentProgress++;
        if (this.currentProgress >= this.targetValue && !this.completed) {
            this.completed = true;
            this.completedAt = LocalDateTime.now();
        }
    }
}
