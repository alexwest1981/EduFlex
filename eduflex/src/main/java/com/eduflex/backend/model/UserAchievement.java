package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_achievements")
@Data
public class UserAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "achievement_id", nullable = false)
    private Long achievementId;

    @ManyToOne(fetch = FetchType.EAGER) // Change to EAGER to ensure data is available or use IgnoreProperties
    @JoinColumn(name = "achievement_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Achievement achievement;

    @Column(name = "progress")
    private Integer progress = 0;

    @Column(name = "unlocked", nullable = false)
    private Boolean unlocked = false;

    @Column(name = "unlocked_at")
    private LocalDateTime unlockedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public void unlock() {
        this.unlocked = true;
        this.unlockedAt = LocalDateTime.now();
    }

    public Boolean getUnlocked() {
        return unlocked;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getAchievementId() {
        return achievementId;
    }

    public Integer getProgress() {
        return progress;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setAchievementId(Long achievementId) {
        this.achievementId = achievementId;
    }
}
