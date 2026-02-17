package com.eduflex.backend.service;

import com.eduflex.backend.model.OrganizationBranding;
import com.eduflex.backend.repository.BrandingRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BrandingService {
    private static final Logger logger = LoggerFactory.getLogger(BrandingService.class);

    private final BrandingRepository brandingRepository;
    private final StorageService storageService;
    private final LicenseService licenseService;
    private final ObjectMapper objectMapper;

    public BrandingService(BrandingRepository brandingRepository,
            StorageService storageService,
            LicenseService licenseService,
            ObjectMapper objectMapper) {
        this.brandingRepository = brandingRepository;
        this.storageService = storageService;
        this.licenseService = licenseService;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void initDefaultBranding() {
        // Create default organization branding if it doesn't exist
        if (!brandingRepository.existsByOrganizationKey("default")) {
            OrganizationBranding defaultBranding = new OrganizationBranding("default", "EduFlex");
            defaultBranding.setFooterText("Powered by EduFlex");
            defaultBranding.setDefaultThemeId("default");
            defaultBranding.setShowPoweredBy(true);
            defaultBranding.setEnforceOrgTheme(false);
            brandingRepository.save(defaultBranding);
            System.out.println("✅ Default Organization Branding created");
        }
    }

    /**
     * Get branding for a specific organization (default: "default")
     */
    public OrganizationBranding getBranding(String organizationKey) {
        return brandingRepository.findByOrganizationKey(organizationKey)
                .orElseGet(() -> {
                    // Return default branding if not found.
                    // Failsafe: If "default" doesn't exist in DB (e.g. new tenant schema), return a
                    // memory object.
                    return brandingRepository.findByOrganizationKey("default")
                            .orElseGet(() -> {
                                OrganizationBranding failsafe = new OrganizationBranding("default", "EduFlex");
                                failsafe.setFooterText("Powered by EduFlex");
                                return failsafe;
                            });
                });
    }

    /**
     * Get all branding configurations (for multi-tenant support in future)
     */
    public List<OrganizationBranding> getAllBrandings() {
        return brandingRepository.findAll();
    }

    /**
     * Update branding configuration
     */
    @Transactional
    public OrganizationBranding updateBranding(String organizationKey, OrganizationBranding updates) {
        // Check if ENTERPRISE_WHITELABEL module is allowed
        if (!licenseService.getTier().isModuleAllowed("ENTERPRISE_WHITELABEL")) {
            throw new RuntimeException("Enterprise Whitelabel-modulen kräver ENTERPRISE-licens. Nuvarande licens: "
                    + licenseService.getTier());
        }

        OrganizationBranding branding = getBranding(organizationKey);

        // Update fields
        if (updates.getBrandName() != null) {
            branding.setBrandName(updates.getBrandName());
        }
        if (updates.getCustomTheme() != null) {
            branding.setCustomTheme(updates.getCustomTheme());
        }
        if (updates.getDefaultThemeId() != null) {
            branding.setDefaultThemeId(updates.getDefaultThemeId());
        }
        if (updates.getFooterText() != null) {
            branding.setFooterText(updates.getFooterText());
        }
        if (updates.getWelcomeMessage() != null) {
            branding.setWelcomeMessage(updates.getWelcomeMessage());
        }
        if (updates.getCustomCss() != null) {
            branding.setCustomCss(updates.getCustomCss());
        }
        if (updates.getDesignSystem() != null) {
            branding.setDesignSystem(updates.getDesignSystem());
        }

        // Update boolean flags
        if (updates.getShowPoweredBy() != null) {
            branding.setShowPoweredBy(updates.getShowPoweredBy());
        }
        if (updates.getEnforceOrgTheme() != null) {
            branding.setEnforceOrgTheme(updates.getEnforceOrgTheme());
        }
        if (updates.getCustomEmailTemplates() != null) {
            branding.setCustomEmailTemplates(updates.getCustomEmailTemplates());
        }

        return brandingRepository.save(branding);
    }

    /**
     * Upload logo and update branding
     */
    @Transactional
    public OrganizationBranding uploadLogo(String organizationKey, MultipartFile file) {
        if (!licenseService.getTier().isModuleAllowed("ENTERPRISE_WHITELABEL")) {
            throw new RuntimeException("Enterprise Whitelabel-modulen kräver ENTERPRISE-licens.");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Endast bildfiler accepteras för logotyp");
        }

        // Store file in MinIO
        String storageId = storageService.save(file);

        // Update branding
        OrganizationBranding branding = getBranding(organizationKey);
        branding.setLogoUrl("/api/storage/" + storageId);
        return brandingRepository.save(branding);
    }

    /**
     * Upload favicon and update branding
     */
    @Transactional
    public OrganizationBranding uploadFavicon(String organizationKey, MultipartFile file) {
        if (!licenseService.getTier().isModuleAllowed("ENTERPRISE_WHITELABEL")) {
            throw new RuntimeException("Enterprise Whitelabel-modulen kräver ENTERPRISE-licens.");
        }

        // Validate file type (allow .ico, .png, .svg)
        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.startsWith("image/") && !contentType.equals("image/x-icon"))) {
            throw new RuntimeException("Endast bildfiler eller .ico-filer accepteras för favicon");
        }

        // Store file in MinIO
        String storageId = storageService.save(file);

        // Update branding
        OrganizationBranding branding = getBranding(organizationKey);
        branding.setFaviconUrl("/api/storage/" + storageId);
        return brandingRepository.save(branding);
    }

    /**
     * Upload login background and update branding
     */
    @Transactional
    public OrganizationBranding uploadLoginBackground(String organizationKey, MultipartFile file) {
        if (!licenseService.getTier().isModuleAllowed("ENTERPRISE_WHITELABEL")) {
            throw new RuntimeException("Enterprise Whitelabel-modulen kräver ENTERPRISE-licens.");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Endast bildfiler accepteras för bakgrundsbild");
        }

        // Store file in MinIO
        String storageId = storageService.save(file);

        // Update branding
        OrganizationBranding branding = getBranding(organizationKey);
        branding.setLoginBackgroundUrl("/api/storage/" + storageId);
        return brandingRepository.save(branding);
    }

    /**
     * Reset branding to default values
     */
    @Transactional
    public OrganizationBranding resetBranding(String organizationKey) {
        if (!licenseService.getTier().isModuleAllowed("ENTERPRISE_WHITELABEL")) {
            throw new RuntimeException("Enterprise Whitelabel-modulen kräver ENTERPRISE-licens.");
        }

        OrganizationBranding branding = getBranding(organizationKey);
        branding.setBrandName("EduFlex");
        branding.setLogoUrl(null);
        branding.setFaviconUrl(null);
        branding.setLoginBackgroundUrl(null);
        branding.setCustomTheme(null);
        branding.setDefaultThemeId("default");
        branding.setFooterText("Powered by EduFlex");
        branding.setWelcomeMessage(null);
        branding.setCustomCss(null);
        branding.setShowPoweredBy(true);
        branding.setEnforceOrgTheme(false);
        branding.setCustomEmailTemplates(false);

        return brandingRepository.save(branding);
    }

    /**
     * Upload PWA specific icon
     */
    @Transactional
    public OrganizationBranding uploadPwaIcon(String organizationKey, MultipartFile file, int size) {
        if (!licenseService.getTier().isModuleAllowed("ENTERPRISE_WHITELABEL")) {
            throw new RuntimeException("Enterprise Whitelabel-modulen kräver ENTERPRISE-licens.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("image/png")) {
            throw new RuntimeException("PWA-ikoner måste vara i PNG-format för bästa kompatibilitet");
        }

        String storageId = storageService.save(file);
        String url = "/api/storage/" + storageId;

        OrganizationBranding branding = getBranding(organizationKey);
        try {
            logger.info("Processing PWA {}x{} icon for organization: {}", size, size, organizationKey);
            Map<String, Object> themeMap = new HashMap<>();
            String currentTheme = branding.getCustomTheme();

            if (currentTheme != null && !currentTheme.trim().isEmpty()) {
                try {
                    themeMap = objectMapper.readValue(currentTheme, new TypeReference<Map<String, Object>>() {
                    });
                } catch (Exception e) {
                    logger.warn("Could not parse existing customTheme JSON, starting fresh. Error: {}", e.getMessage());
                }
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> pwaMap = themeMap.containsKey("pwa") && themeMap.get("pwa") instanceof Map
                    ? (Map<String, Object>) themeMap.get("pwa")
                    : new HashMap<String, Object>();

            pwaMap.put(size == 192 ? "icon192" : "icon512", url);
            themeMap.put("pwa", pwaMap);

            String updatedThemeJson = objectMapper.writeValueAsString(themeMap);
            branding.setCustomTheme(updatedThemeJson);
            logger.debug("Updated customTheme for PWA icons: {}", updatedThemeJson);
        } catch (Exception e) {
            logger.error("Failed to update PWA theme settings: {}", e.getMessage(), e);
            throw new RuntimeException("Kunde inte uppdatera PWA-inställningar: " + e.getMessage());
        }

        return brandingRepository.save(branding);
    }

    /**
     * Check if user can access whitelabeling features
     */
    public boolean canAccessWhitelabeling() {
        return licenseService.getTier().isModuleAllowed("ENTERPRISE_WHITELABEL");
    }

    /**
     * Generate dynamic PWA manifest for an organization
     */
    public Map<String, Object> generateManifest(String organizationKey) {
        OrganizationBranding branding = getBranding(organizationKey);
        Map<String, Object> manifest = new HashMap<>();

        // Default values
        String appName = branding.getBrandName();
        String shortName = branding.getBrandName();
        String themeColor = "#6366f1";
        String backgroundColor = "#ffffff";

        // Override from customTheme if available
        if (branding.getCustomTheme() != null) {
            try {
                JsonNode root = objectMapper.readTree(branding.getCustomTheme());
                if (root.has("pwa")) {
                    JsonNode pwa = root.get("pwa");
                    if (pwa.has("appName") && !pwa.get("appName").asText().isEmpty()) {
                        appName = pwa.get("appName").asText();
                    }
                    if (pwa.has("shortName") && !pwa.get("shortName").asText().isEmpty()) {
                        shortName = pwa.get("shortName").asText();
                    }
                    if (pwa.has("themeColor") && !pwa.get("themeColor").asText().isEmpty()) {
                        themeColor = pwa.get("themeColor").asText();
                    }
                    if (pwa.has("backgroundColor") && !pwa.get("backgroundColor").asText().isEmpty()) {
                        backgroundColor = pwa.get("backgroundColor").asText();
                    }
                }
            } catch (Exception e) {
                // Ignore parse errors, use defaults or what we have
            }
        }

        manifest.put("name", appName);
        manifest.put("short_name", shortName);
        manifest.put("description", "EduFlex Learning Management System - " + appName);
        manifest.put("start_url", "/");
        manifest.put("display", "standalone");
        manifest.put("orientation", "any");
        manifest.put("background_color", backgroundColor);
        manifest.put("theme_color", themeColor);

        // Icons
        List<Map<String, String>> icons = new ArrayList<>();

        String icon192Url = "/pwa-192x192.png";
        String icon512Url = "/pwa-512x512.png";

        // Override from customTheme if available
        if (branding.getCustomTheme() != null) {
            try {
                JsonNode root = objectMapper.readTree(branding.getCustomTheme());
                if (root.has("pwa")) {
                    JsonNode pwa = root.get("pwa");
                    if (pwa.has("icon192"))
                        icon192Url = pwa.get("icon192").asText();
                    if (pwa.has("icon512"))
                        icon512Url = pwa.get("icon512").asText();
                }
            } catch (Exception e) {
                // Ignore
            }
        }

        Map<String, String> icon192 = new HashMap<>();
        icon192.put("src", icon192Url);
        icon192.put("sizes", "192x192");
        icon192.put("type", "image/png");
        icon192.put("purpose", "any maskable");

        Map<String, String> icon512 = new HashMap<>();
        icon512.put("src", icon512Url);
        icon512.put("sizes", "512x512");
        icon512.put("type", "image/png");
        icon512.put("purpose", "any maskable");

        icons.add(icon192);
        icons.add(icon512);
        manifest.put("icons", icons);

        return manifest;
    }
}
