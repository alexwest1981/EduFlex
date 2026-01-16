package com.eduflex.backend.service;

import com.eduflex.backend.model.OrganizationBranding;
import com.eduflex.backend.repository.BrandingRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class BrandingService {

    private final BrandingRepository brandingRepository;
    private final FileStorageService fileStorageService;
    private final LicenseService licenseService;

    public BrandingService(BrandingRepository brandingRepository,
            FileStorageService fileStorageService,
            LicenseService licenseService) {
        this.brandingRepository = brandingRepository;
        this.fileStorageService = fileStorageService;
        this.licenseService = licenseService;
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
        String logoUrl = fileStorageService.storeFile(file);

        // Update branding
        OrganizationBranding branding = getBranding(organizationKey);
        branding.setLogoUrl(logoUrl);
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
        String faviconUrl = fileStorageService.storeFile(file);

        // Update branding
        OrganizationBranding branding = getBranding(organizationKey);
        branding.setFaviconUrl(faviconUrl);
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
        String backgroundUrl = fileStorageService.storeFile(file);

        // Update branding
        OrganizationBranding branding = getBranding(organizationKey);
        branding.setLoginBackgroundUrl(backgroundUrl);
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
     * Check if user can access whitelabeling features
     */
    public boolean canAccessWhitelabeling() {
        return licenseService.getTier().isModuleAllowed("ENTERPRISE_WHITELABEL");
    }
}
