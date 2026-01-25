package com.eduflex.backend.model.community;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a shared educational content item in EduFlex Community.
 * Stored in public schema for cross-tenant visibility.
 */
@Entity
@Table(name = "community_items", schema = "public")
public class CommunityItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContentType contentType;

    @Column(nullable = false)
    private String title;

    @Column(length = 5000)
    private String description;

    /**
     * Serialized content (Quiz/Assignment/Lesson as JSON)
     */
    @Column(columnDefinition = "TEXT")
    private String contentJson;

    /**
     * Subject category (Matematik, Svenska, etc.)
     */
    @Enumerated(EnumType.STRING)
    private CommunitySubject subject;

    /**
     * Difficulty level (BEGINNER, INTERMEDIATE, ADVANCED)
     */
    private String difficulty;

    /**
     * Target grade level (Grundskola, Gymnasium, etc.)
     */
    private String gradeLevel;

    /**
     * Tags for search and filtering
     */
    @ElementCollection
    @CollectionTable(name = "community_item_tags", schema = "public",
            joinColumns = @JoinColumn(name = "community_item_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    // === Statistics ===

    @Column(nullable = false)
    private int downloadCount = 0;

    @Column(nullable = false)
    private double averageRating = 0.0;

    @Column(nullable = false)
    private int ratingCount = 0;

    // === Author Info (denormalized for cross-tenant display) ===

    private String authorName;
    private String authorTenantId;
    private String authorTenantName;
    private Long authorUserId;
    private String authorProfilePictureUrl;

    // === Timestamps ===

    private LocalDateTime publishedAt;
    private LocalDateTime updatedAt;
    private LocalDateTime createdAt;

    // === Status ===

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PublishStatus status = PublishStatus.PENDING;

    /**
     * Rejection reason (if status = REJECTED)
     */
    @Column(length = 1000)
    private String rejectionReason;

    /**
     * Content-specific metadata as JSON
     * E.g., {questionCount, estimatedMinutes, attachmentCount, hasVideo}
     */
    @Column(columnDefinition = "TEXT")
    private String metadata;

    // === Lifecycle Callbacks ===

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // === Getters and Setters ===

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ContentType getContentType() {
        return contentType;
    }

    public void setContentType(ContentType contentType) {
        this.contentType = contentType;
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

    public String getContentJson() {
        return contentJson;
    }

    public void setContentJson(String contentJson) {
        this.contentJson = contentJson;
    }

    public CommunitySubject getSubject() {
        return subject;
    }

    public void setSubject(CommunitySubject subject) {
        this.subject = subject;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(String gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public int getDownloadCount() {
        return downloadCount;
    }

    public void setDownloadCount(int downloadCount) {
        this.downloadCount = downloadCount;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public int getRatingCount() {
        return ratingCount;
    }

    public void setRatingCount(int ratingCount) {
        this.ratingCount = ratingCount;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getAuthorTenantId() {
        return authorTenantId;
    }

    public void setAuthorTenantId(String authorTenantId) {
        this.authorTenantId = authorTenantId;
    }

    public String getAuthorTenantName() {
        return authorTenantName;
    }

    public void setAuthorTenantName(String authorTenantName) {
        this.authorTenantName = authorTenantName;
    }

    public Long getAuthorUserId() {
        return authorUserId;
    }

    public void setAuthorUserId(Long authorUserId) {
        this.authorUserId = authorUserId;
    }

    public String getAuthorProfilePictureUrl() {
        return authorProfilePictureUrl;
    }

    public void setAuthorProfilePictureUrl(String authorProfilePictureUrl) {
        this.authorProfilePictureUrl = authorProfilePictureUrl;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public PublishStatus getStatus() {
        return status;
    }

    public void setStatus(PublishStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    // === Helper Methods ===

    public void incrementDownloadCount() {
        this.downloadCount++;
    }

    public void updateRating(double newAverage, int newCount) {
        this.averageRating = newAverage;
        this.ratingCount = newCount;
    }
}
