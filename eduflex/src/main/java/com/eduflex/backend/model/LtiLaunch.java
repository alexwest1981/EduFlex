package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Entity
@Table(name = "lti_launches")
public class LtiLaunch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String platformIssuer;

    @Column(nullable = false)
    private String userSub; // LMS User ID (subject)

    @Column(nullable = false)
    private String resourceLinkId;

    private String targetLinkUri;
    private String deploymentId;

    private String agsLineItemUrl;
    private String agsLineItemsUrl;
    private String nrpsMembershipUrl;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    // Manual Getters and Setters
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

    public String getPlatformIssuer() {
        return platformIssuer;
    }

    public void setPlatformIssuer(String platformIssuer) {
        this.platformIssuer = platformIssuer;
    }

    public String getUserSub() {
        return userSub;
    }

    public void setUserSub(String userSub) {
        this.userSub = userSub;
    }

    public String getResourceLinkId() {
        return resourceLinkId;
    }

    public void setResourceLinkId(String resourceLinkId) {
        this.resourceLinkId = resourceLinkId;
    }

    public String getTargetLinkUri() {
        return targetLinkUri;
    }

    public void setTargetLinkUri(String targetLinkUri) {
        this.targetLinkUri = targetLinkUri;
    }

    public String getDeploymentId() {
        return deploymentId;
    }

    public void setDeploymentId(String deploymentId) {
        this.deploymentId = deploymentId;
    }

    public String getAgsLineItemUrl() {
        return agsLineItemUrl;
    }

    public void setAgsLineItemUrl(String agsLineItemUrl) {
        this.agsLineItemUrl = agsLineItemUrl;
    }

    public String getAgsLineItemsUrl() {
        return agsLineItemsUrl;
    }

    public void setAgsLineItemsUrl(String agsLineItemsUrl) {
        this.agsLineItemsUrl = agsLineItemsUrl;
    }

    public String getNrpsMembershipUrl() {
        return nrpsMembershipUrl;
    }

    public void setNrpsMembershipUrl(String nrpsMembershipUrl) {
        this.nrpsMembershipUrl = nrpsMembershipUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
