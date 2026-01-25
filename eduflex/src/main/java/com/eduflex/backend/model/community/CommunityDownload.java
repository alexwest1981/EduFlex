package com.eduflex.backend.model.community;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Tracks when users install/download community content to their local resources.
 * Stored in public schema for cross-tenant tracking.
 */
@Entity
@Table(name = "community_downloads", schema = "public",
        indexes = {
                @Index(name = "idx_community_download_item", columnList = "community_item_id"),
                @Index(name = "idx_community_download_user", columnList = "user_id, tenant_id")
        })
public class CommunityDownload {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "community_item_id", nullable = false)
    private String communityItemId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    private LocalDateTime downloadedAt;

    /**
     * ID of the locally created item after installation
     */
    private Long localItemId;

    /**
     * Type of the local item (QUIZ, ASSIGNMENT, LESSON)
     */
    private String localItemType;

    @PrePersist
    protected void onCreate() {
        downloadedAt = LocalDateTime.now();
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

    public LocalDateTime getDownloadedAt() {
        return downloadedAt;
    }

    public void setDownloadedAt(LocalDateTime downloadedAt) {
        this.downloadedAt = downloadedAt;
    }

    public Long getLocalItemId() {
        return localItemId;
    }

    public void setLocalItemId(Long localItemId) {
        this.localItemId = localItemId;
    }

    public String getLocalItemType() {
        return localItemType;
    }

    public void setLocalItemType(String localItemType) {
        this.localItemType = localItemType;
    }
}
