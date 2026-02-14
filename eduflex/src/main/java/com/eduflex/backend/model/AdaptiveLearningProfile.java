package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "adaptive_learning_profiles")
public class AdaptiveLearningProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // VAK Model (0-100 scale)
    private int visualScore;
    private int auditoryScore;
    private int kinestheticScore;

    // Learning Pace preference (SLOW, MODERATE, FAST)
    @Enumerated(EnumType.STRING)
    private LearningPace pacePreference = LearningPace.MODERATE;

    // JSON array of subject areas or tags where the student struggles
    @Column(columnDefinition = "TEXT")
    private String struggleAreas; // e.g., ["Math:Algebra", "Physics:Mechanics"]

    // JSON array of subject areas where the student excels
    @Column(columnDefinition = "TEXT")
    private String strengthAreas;

    private LocalDateTime lastAnalyzed;

    public enum LearningPace {
        SLOW, MODERATE, FAST
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public int getVisualScore() {
        return visualScore;
    }

    public void setVisualScore(int visualScore) {
        this.visualScore = visualScore;
    }

    public int getAuditoryScore() {
        return auditoryScore;
    }

    public void setAuditoryScore(int auditoryScore) {
        this.auditoryScore = auditoryScore;
    }

    public int getKinestheticScore() {
        return kinestheticScore;
    }

    public void setKinestheticScore(int kinestheticScore) {
        this.kinestheticScore = kinestheticScore;
    }

    public LearningPace getPacePreference() {
        return pacePreference;
    }

    public void setPacePreference(LearningPace pacePreference) {
        this.pacePreference = pacePreference;
    }

    public String getStruggleAreas() {
        return struggleAreas;
    }

    public void setStruggleAreas(String struggleAreas) {
        this.struggleAreas = struggleAreas;
    }

    public String getStrengthAreas() {
        return strengthAreas;
    }

    public void setStrengthAreas(String strengthAreas) {
        this.strengthAreas = strengthAreas;
    }

    public LocalDateTime getLastAnalyzed() {
        return lastAnalyzed;
    }

    public void setLastAnalyzed(LocalDateTime lastAnalyzed) {
        this.lastAnalyzed = lastAnalyzed;
    }
}
