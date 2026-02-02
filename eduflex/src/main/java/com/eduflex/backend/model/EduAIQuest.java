package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "eduai_quests")
@JsonIgnoreProperties(ignoreUnknown = true)
public class EduAIQuest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(length = 2000)
    private String narrative; // The AI-generated story context

    @Enumerated(EnumType.STRING)
    private QuestObjectiveType objectiveType;

    private Long objectiveId; // ID of the lesson, quiz, or assignment

    private int rewardXp;

    private boolean isCompleted;

    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    public EduAIQuest() {
    }

    public EduAIQuest(Long id, Long userId, String title, String description, String narrative,
            QuestObjectiveType objectiveType, Long objectiveId, int rewardXp, boolean isCompleted,
            LocalDateTime createdAt, LocalDateTime completedAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.narrative = narrative;
        this.objectiveType = objectiveType;
        this.objectiveId = objectiveId;
        this.rewardXp = rewardXp;
        this.isCompleted = isCompleted;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum QuestObjectiveType {
        LESSON, QUIZ, ASSIGNMENT, CUSTOM
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getNarrative() {
        return narrative;
    }

    public void setNarrative(String narrative) {
        this.narrative = narrative;
    }

    public QuestObjectiveType getObjectiveType() {
        return objectiveType;
    }

    public void setObjectiveType(QuestObjectiveType objectiveType) {
        this.objectiveType = objectiveType;
    }

    public Long getObjectiveId() {
        return objectiveId;
    }

    public void setObjectiveId(Long objectiveId) {
        this.objectiveId = objectiveId;
    }

    public int getRewardXp() {
        return rewardXp;
    }

    public void setRewardXp(int rewardXp) {
        this.rewardXp = rewardXp;
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public void setCompleted(boolean completed) {
        isCompleted = completed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
