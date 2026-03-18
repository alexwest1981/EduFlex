package com.eduflex.scorm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "xapi_agent_profiles", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "agentId", "profileId" })
})
public class XApiAgentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String agentId;

    @Column(nullable = false)
    private String profileId;

    @Column(columnDefinition = "TEXT")
    private String profileDocument;

    private LocalDateTime updatedAt;

    public XApiAgentProfile() {
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAgentId() {
        return agentId;
    }

    public void setAgentId(String agentId) {
        this.agentId = agentId;
    }

    public String getProfileId() {
        return profileId;
    }

    public void setProfileId(String profileId) {
        this.profileId = profileId;
    }

    public String getProfileDocument() {
        return profileDocument;
    }

    public void setProfileDocument(String profileDocument) {
        this.profileDocument = profileDocument;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
