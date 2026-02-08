package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_streaks")
@Data
public class UserStreak {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "streak_type", nullable = false)
    private String streakType; // LOGIN, ASSIGNMENT, PERFECT_SCORE

    @Column(name = "current_streak", nullable = false)
    private Integer currentStreak = 0;

    @Column(name = "longest_streak", nullable = false)
    private Integer longestStreak = 0;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @Column(name = "freezes_available", nullable = false)
    private Integer freezesAvailable = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void incrementStreak() {
        this.currentStreak++;
        if (this.currentStreak > this.longestStreak) {
            this.longestStreak = this.currentStreak;
        }
        this.lastActivityDate = LocalDate.now();
    }

    public void resetStreak() {
        this.currentStreak = 0;
        this.lastActivityDate = LocalDate.now();
    }

    public void useFreeze() {
        if (this.freezesAvailable > 0) {
            this.freezesAvailable--;
            this.lastActivityDate = LocalDate.now();
        }
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public Integer getCurrentStreak() {
        return currentStreak;
    }

    public LocalDate getLastActivityDate() {
        return lastActivityDate;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setStreakType(String streakType) {
        this.streakType = streakType;
    }

    public void setCurrentStreak(Integer currentStreak) {
        this.currentStreak = currentStreak;
    }

    public Integer getLongestStreak() {
        return longestStreak;
    }

    public void setLongestStreak(Integer longestStreak) {
        this.longestStreak = longestStreak;
    }

    public void setLastActivityDate(LocalDate lastActivityDate) {
        this.lastActivityDate = lastActivityDate;
    }

    public Integer getFreezesAvailable() {
        return freezesAvailable;
    }

    public void setFreezesAvailable(Integer freezesAvailable) {
        this.freezesAvailable = freezesAvailable;
    }
}
