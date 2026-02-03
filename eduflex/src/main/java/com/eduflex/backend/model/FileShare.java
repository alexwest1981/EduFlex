package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "file_shares")
public class FileShare {

    public enum ShareTargetType {
        USER, GROUP, COURSE, LESSON, LINK
    }

    public enum PermissionLevel {
        VIEW, EDIT, MANAGE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Enumerated(EnumType.STRING)
    private ShareTargetType targetType;

    private Long targetId; // Represents userId, groupId, courseId, lessonId etc.

    @Enumerated(EnumType.STRING)
    private PermissionLevel permission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_by_id", nullable = false)
    private User sharedBy;

    private LocalDateTime sharedAt;

    private String linkToken; // Used for PUBLIC_LINK sharing
    private LocalDateTime expiresAt;

    public FileShare() {
    }

    @PrePersist
    protected void onShare() {
        sharedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Document getDocument() {
        return document;
    }

    public void setDocument(Document document) {
        this.document = document;
    }

    public ShareTargetType getTargetType() {
        return targetType;
    }

    public void setTargetType(ShareTargetType targetType) {
        this.targetType = targetType;
    }

    public Long getTargetId() {
        return targetId;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    public PermissionLevel getPermission() {
        return permission;
    }

    public void setPermission(PermissionLevel permission) {
        this.permission = permission;
    }

    public User getSharedBy() {
        return sharedBy;
    }

    public void setSharedBy(User sharedBy) {
        this.sharedBy = sharedBy;
    }

    public LocalDateTime getSharedAt() {
        return sharedAt;
    }

    public void setSharedAt(LocalDateTime sharedAt) {
        this.sharedAt = sharedAt;
    }

    public String getLinkToken() {
        return linkToken;
    }

    public void setLinkToken(String linkToken) {
        this.linkToken = linkToken;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}
