package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "adaptive_recommendations")
public class AdaptiveRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Type of recommendation: CONTENT_REVIEW, PRACTICE_QUIZ, ADVANCED_TOPIC,
    // MENTOR_MEETING
    @Enumerated(EnumType.STRING)
    private RecommendationType type;

    // Optional link to content
    private String contentUrl; // Internal or external link

    // Reasoning from AI
    @Column(columnDefinition = "TEXT")
    private String aiReasoning; // Short summary (already exists)

    @Column(columnDefinition = "TEXT")
    private String reasoningTrace; // Detailed XAI explanation ("Why?")

    private int priorityScore = 0; // 0-100

    private Long associatedCourseId; // Optional link to a course

    // Status: NEW, IN_PROGRESS, COMPLETED, DISMISSED, INVALIDATED
    @Enumerated(EnumType.STRING)
    private Status status = Status.NEW;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum RecommendationType {
        CONTENT_REVIEW, PRACTICE_QUIZ, ADVANCED_TOPIC, MENTOR_MEETING, STREAK_REPAIR, CHALLENGE_YOURSELF
    }

    public enum Status {
        NEW, IN_PROGRESS, COMPLETED, DISMISSED, EXPIRED, INVALIDATED
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

    public RecommendationType getType() {
        return type;
    }

    public void setType(RecommendationType type) {
        this.type = type;
    }

    public String getContentUrl() {
        return contentUrl;
    }

    public void setContentUrl(String contentUrl) {
        this.contentUrl = contentUrl;
    }

    public String getAiReasoning() {
        return aiReasoning;
    }

    public void setAiReasoning(String aiReasoning) {
        this.aiReasoning = aiReasoning;
    }

    public String getReasoningTrace() {
        return reasoningTrace;
    }

    public void setReasoningTrace(String reasoningTrace) {
        this.reasoningTrace = reasoningTrace;
    }

    public int getPriorityScore() {
        return priorityScore;
    }

    public void setPriorityScore(int priorityScore) {
        this.priorityScore = priorityScore;
    }

    public Long getAssociatedCourseId() {
        return associatedCourseId;
    }

    public void setAssociatedCourseId(Long associatedCourseId) {
        this.associatedCourseId = associatedCourseId;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
