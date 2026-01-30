package com.eduflex.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "lti_platforms")
public class LtiPlatform {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String issuer; // e.g., "https://canvas.instructure.com"

    @Column(nullable = false)
    private String clientId;

    @Column(nullable = false)
    private String authUrl; // OIDC Auth URL from LMS

    @Column(nullable = false)
    private String tokenUrl; // Access Token URL

    @Column(nullable = false)
    private String jwksUrl; // URL to fetch LMS public keys

    private String deploymentId; // Optional specific deployment ID if needed

    private String tenantId; // The tenant this platform belongs to (id from public.tenants)

    public LtiPlatform() {
    }

    public LtiPlatform(String issuer, String clientId, String authUrl, String tokenUrl, String jwksUrl) {
        this.issuer = issuer;
        this.clientId = clientId;
        this.authUrl = authUrl;
        this.tokenUrl = tokenUrl;
        this.jwksUrl = jwksUrl;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getAuthUrl() {
        return authUrl;
    }

    public void setAuthUrl(String authUrl) {
        this.authUrl = authUrl;
    }

    public String getTokenUrl() {
        return tokenUrl;
    }

    public void setTokenUrl(String tokenUrl) {
        this.tokenUrl = tokenUrl;
    }

    public String getJwksUrl() {
        return jwksUrl;
    }

    public void setJwksUrl(String jwksUrl) {
        this.jwksUrl = jwksUrl;
    }

    public String getDeploymentId() {
        return deploymentId;
    }

    public void setDeploymentId(String deploymentId) {
        this.deploymentId = deploymentId;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }
}
