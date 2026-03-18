package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "read_audit_logs")
public class ReadAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor; // The user who performed the read action

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id")
    private User targetUser; // The user whose profile was read

    @Column(nullable = false)
    private String resourceAccessed; // E.g., "USER_PROFILE", "STUDENT_GRADES"

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column
    private String ipAddress;

    @Column
    private String userAgent;

    public ReadAuditLog() {
    }

    public ReadAuditLog(User actor, User targetUser, String resourceAccessed, String ipAddress, String userAgent) {
        this.actor = actor;
        this.targetUser = targetUser;
        this.resourceAccessed = resourceAccessed;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.timestamp = java.time.LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getActor() {
        return actor;
    }

    public void setActor(User actor) {
        this.actor = actor;
    }

    public User getTargetUser() {
        return targetUser;
    }

    public void setTargetUser(User targetUser) {
        this.targetUser = targetUser;
    }

    public String getResourceAccessed() {
        return resourceAccessed;
    }

    public void setResourceAccessed(String resourceAccessed) {
        this.resourceAccessed = resourceAccessed;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
}
