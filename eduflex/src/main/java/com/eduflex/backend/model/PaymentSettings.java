package com.eduflex.backend.model;

import jakarta.persistence.*;

/**
 * Entity for storing payment gateway configuration (API keys, etc.)
 * Sensitive data should be encrypted in production
 */
@Entity
@Table(name = "payment_settings")
public class PaymentSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider")
    private String provider = "STRIPE"; // STRIPE, PAYPAL, SWISH, etc.

    @Column(name = "api_key", columnDefinition = "TEXT")
    private String apiKey;

    @Column(name = "webhook_secret", columnDefinition = "TEXT")
    private String webhookSecret;

    @Column(name = "is_test_mode")
    private Boolean isTestMode = true;

    @Column(name = "enabled_methods", columnDefinition = "TEXT")
    private String enabledMethods = "CARD,SWISH,INVOICE"; // Comma-separated list

    @Column(name = "is_active")
    private Boolean isActive = false;

    @Column(name = "domain_url", columnDefinition = "TEXT")
    private String domainUrl;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }

    public void setWebhookSecret(String webhookSecret) {
        this.webhookSecret = webhookSecret;
    }

    public Boolean getIsTestMode() {
        return isTestMode;
    }

    public void setIsTestMode(Boolean isTestMode) {
        this.isTestMode = isTestMode;
    }

    public String getEnabledMethods() {
        return enabledMethods;
    }

    public void setEnabledMethods(String enabledMethods) {
        this.enabledMethods = enabledMethods;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getDomainUrl() {
        return domainUrl;
    }

    public void setDomainUrl(String domainUrl) {
        this.domainUrl = domainUrl;
    }
}
