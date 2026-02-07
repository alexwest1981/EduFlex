package com.eduflex.backend.model;

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
    private String agentId; // E.g., email or mbox

    @Column(nullable = false)
    private String profileId;

    @Column(columnDefinition = "TEXT")
    private String profileDocument;

    private LocalDateTime lastUpdated;

    public XApiAgentProfile() {
    }

    public XApiAgentProfile(String agentId, String profileId, String profileDocument) {
        this.agentId = agentId;
        this.profileId = profileId;
        this.profileDocument = profileDocument;
        this.lastUpdated = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }

    public Long getId() {
        return id;
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

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
}
