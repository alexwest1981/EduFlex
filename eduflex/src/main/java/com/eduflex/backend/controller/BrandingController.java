package com.eduflex.backend.controller;

import com.eduflex.backend.model.OrganizationBranding;
import com.eduflex.backend.service.BrandingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/branding")
public class BrandingController {
    private static final Logger logger = LoggerFactory.getLogger(BrandingController.class);

    private final BrandingService brandingService;

    public BrandingController(BrandingService brandingService) {
        this.brandingService = brandingService;
    }

    /**
     * Get branding for current organization (public endpoint for frontend to load
     * branding)
     */
    @GetMapping
    public ResponseEntity<?> getBranding(
            @RequestParam(defaultValue = "default") String organizationKey) {
        try {
            OrganizationBranding branding = brandingService.getBranding(organizationKey);
            return ResponseEntity.ok(branding);
        } catch (Exception e) {
            logger.error("❌ Branding Error for {}: {}", organizationKey, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown Error", "trace",
                            e.toString()));
        }
    }

    /**
     * Get dynamic PWA manifest for an organization
     */
    @GetMapping("/manifest.json")
    public ResponseEntity<?> getManifest(
            @RequestParam(defaultValue = "default") String organizationKey) {
        try {
            Map<String, Object> manifest = brandingService.generateManifest(organizationKey);
            return ResponseEntity.ok(manifest);
        } catch (Exception e) {
            logger.error("❌ Manifest Error for {}: {}", organizationKey, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown Error", "trace",
                            e.toString()));
        }
    }

    /**
     * Get all branding configurations (admin only, for multi-tenant management)
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<List<OrganizationBranding>> getAllBrandings() {
        try {
            List<OrganizationBranding> brandings = brandingService.getAllBrandings();
            return ResponseEntity.ok(brandings);
        } catch (Exception e) {
            logger.error("Error fetching all brandings: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update branding configuration (admin only)
     */
    @PutMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> updateBranding(
            @RequestParam(defaultValue = "default") String organizationKey,
            @RequestBody OrganizationBranding updates) {
        try {
            OrganizationBranding updated = brandingService.updateBranding(organizationKey, updates);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error updating branding for {}: {}", organizationKey, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ett fel uppstod vid uppdatering av branding: " + e.getMessage()));
        }
    }

    /**
     * Upload logo (admin only)
     */
    @PostMapping("/logo")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> uploadLogo(
            @RequestParam(defaultValue = "default") String organizationKey,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Ingen fil uppladdad"));
            }

            OrganizationBranding updated = brandingService.uploadLogo(organizationKey, file);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ett fel uppstod vid uppladdning av logotyp"));
        }
    }

    /**
     * Upload favicon (admin only)
     */
    @PostMapping("/favicon")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> uploadFavicon(
            @RequestParam(defaultValue = "default") String organizationKey,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Ingen fil uppladdad"));
            }

            OrganizationBranding updated = brandingService.uploadFavicon(organizationKey, file);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ett fel uppstod vid uppladdning av favicon"));
        }
    }

    /**
     * Upload login background image (admin only)
     */
    @PostMapping("/login-background")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> uploadLoginBackground(
            @RequestParam(defaultValue = "default") String organizationKey,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Ingen fil uppladdad"));
            }

            OrganizationBranding updated = brandingService.uploadLoginBackground(organizationKey, file);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ett fel uppstod vid uppladdning av bakgrundsbild"));
        }
    }

    /**
     * Reset branding to default (admin only)
     */
    @PostMapping("/reset")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> resetBranding(
            @RequestParam(defaultValue = "default") String organizationKey) {
        try {
            OrganizationBranding reset = brandingService.resetBranding(organizationKey);
            return ResponseEntity.ok(reset);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ett fel uppstod vid återställning av branding"));
        }
    }

    /**
     * Upload PWA icon 192x192 (admin only)
     */
    @PostMapping("/pwa-icon-192")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> uploadPwaIcon192(
            @RequestParam(defaultValue = "default") String organizationKey,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ingen fil uppladdad"));
            }
            OrganizationBranding updated = brandingService.uploadPwaIcon(organizationKey, file, 192);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("PWA 192 Icon Upload Error: {}", e.getMessage(), e);
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Okänt serverfel vid uppladdning";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Kunde inte ladda upp PWA-ikon: " + errorMsg));
        }
    }

    /**
     * Upload PWA icon 512x512 (admin only)
     */
    @PostMapping("/pwa-icon-512")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> uploadPwaIcon512(
            @RequestParam(defaultValue = "default") String organizationKey,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ingen fil uppladdad"));
            }
            OrganizationBranding updated = brandingService.uploadPwaIcon(organizationKey, file, 512);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("PWA 512 Icon Upload Error: {}", e.getMessage(), e);
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Okänt serverfel vid uppladdning";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Kunde inte ladda upp PWA-ikon: " + errorMsg));
        }
    }

    /**
     * Check if user can access whitelabeling features
     */
    @GetMapping("/access")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Boolean>> checkAccess() {
        boolean hasAccess = brandingService.canAccessWhitelabeling();
        return ResponseEntity.ok(Map.of("hasAccess", hasAccess));
    }
}
