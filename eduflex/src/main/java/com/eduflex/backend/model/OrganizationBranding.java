package com.eduflex.backend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "organization_branding")
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrganizationBranding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String organizationKey = "default"; // For multi-tenant support in future

    // Basic branding
    @Column(length = 255)
    private String brandName = "EduFlex";

    @Column(length = 500)
    private String logoUrl; // MinIO URL for main logo

    @Column(length = 500)
    private String faviconUrl; // MinIO URL for favicon

    @Column(length = 500)
    private String loginBackgroundUrl; // MinIO URL for login page background

    // Custom theme (JSON stored as TEXT)
    @Column(columnDefinition = "TEXT")
    private String customTheme; // JSON: { "50": "#...", "100": "#...", ..., "900": "#..." }

    @Column(length = 50)
    private String defaultThemeId = "default"; // Fallback if customTheme is null

    // Branding text
    @Column(length = 255)
    private String footerText = "Powered by EduFlex";

    @Column(columnDefinition = "TEXT")
    private String welcomeMessage; // Custom welcome message on login page

    // Feature toggles
    @Column(nullable = false)
    private Boolean showPoweredBy = true;

    @Column(nullable = false)
    private Boolean enforceOrgTheme = true; // If true, users cannot change theme

    @Column(nullable = false)
    private Boolean customEmailTemplates = false; // Future: use branded email templates

    // Custom CSS (advanced)
    @Column(columnDefinition = "TEXT")
    private String customCss; // Optional CSS overrides for ultimate customization

    // Design System (Enterprise feature)
    @Column(length = 50)
    private String designSystem = "minimal"; // glassmorphism, minimal, neomorphism, material, brutalism

    @Column(nullable = false)
    private Boolean showLogoInMenu = true;

    @Column(length = 50)
    private String primaryColor = "#6366f1";

    @Column(length = 50)
    private String secondaryColor = "#4f46e5";

    // Metadata
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Constructors
    public OrganizationBranding() {
    }

    public OrganizationBranding(String organizationKey, String brandName) {
        this.organizationKey = organizationKey;
        this.brandName = brandName;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrganizationKey() {
        return organizationKey;
    }

    public void setOrganizationKey(String organizationKey) {
        this.organizationKey = organizationKey;
    }

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getFaviconUrl() {
        return faviconUrl;
    }

    public void setFaviconUrl(String faviconUrl) {
        this.faviconUrl = faviconUrl;
    }

    public String getLoginBackgroundUrl() {
        return loginBackgroundUrl;
    }

    public void setLoginBackgroundUrl(String loginBackgroundUrl) {
        this.loginBackgroundUrl = loginBackgroundUrl;
    }

    public String getCustomTheme() {
        return customTheme;
    }

    public void setCustomTheme(String customTheme) {
        this.customTheme = customTheme;
    }

    public String getDefaultThemeId() {
        return defaultThemeId;
    }

    public void setDefaultThemeId(String defaultThemeId) {
        this.defaultThemeId = defaultThemeId;
    }

    public String getFooterText() {
        return footerText;
    }

    public void setFooterText(String footerText) {
        this.footerText = footerText;
    }

    public String getWelcomeMessage() {
        return welcomeMessage;
    }

    public void setWelcomeMessage(String welcomeMessage) {
        this.welcomeMessage = welcomeMessage;
    }

    public Boolean getShowPoweredBy() {
        return showPoweredBy;
    }

    public void setShowPoweredBy(Boolean showPoweredBy) {
        this.showPoweredBy = showPoweredBy;
    }

    public Boolean getEnforceOrgTheme() {
        return enforceOrgTheme;
    }

    public void setEnforceOrgTheme(Boolean enforceOrgTheme) {
        this.enforceOrgTheme = enforceOrgTheme;
    }

    public Boolean getCustomEmailTemplates() {
        return customEmailTemplates;
    }

    public void setCustomEmailTemplates(Boolean customEmailTemplates) {
        this.customEmailTemplates = customEmailTemplates;
    }

    public String getCustomCss() {
        return customCss;
    }

    public void setCustomCss(String customCss) {
        this.customCss = customCss;
    }

    public String getDesignSystem() {
        return designSystem;
    }

    public void setDesignSystem(String designSystem) {
        this.designSystem = designSystem;
    }

    public Boolean getShowLogoInMenu() {
        return showLogoInMenu;
    }

    public void setShowLogoInMenu(Boolean showLogoInMenu) {
        this.showLogoInMenu = showLogoInMenu;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public void setPrimaryColor(String primaryColor) {
        this.primaryColor = primaryColor;
    }

    public String getSecondaryColor() {
        return secondaryColor;
    }

    public void setSecondaryColor(String secondaryColor) {
        this.secondaryColor = secondaryColor;
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
