package com.eduflex.backend.model.community;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Represents a user rating/review for a community item.
 * Stored in public schema for cross-tenant visibility.
 */
@Entity
@Table(name = "community_ratings", schema = "public",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_community_rating_user_item",
                columnNames = {"community_item_id", "user_id", "tenant_id"}
        ))
public class CommunityRating {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "community_item_id", nullable = false)
    private String communityItemId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    /**
     * Rating value (1-5 stars)
     */
    @Column(nullable = false)
    private int rating;

    /**
     * Optional review comment
     */
    @Column(length = 2000)
    private String comment;

    /**
     * Reviewer's display name (denormalized)
     */
    private String reviewerName;

    private LocalDateTime createdAt;
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

    // === Getters and Setters ===

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCommunityItemId() {
        return communityItemId;
    }

    public void setCommunityItemId(String communityItemId) {
        this.communityItemId = communityItemId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
