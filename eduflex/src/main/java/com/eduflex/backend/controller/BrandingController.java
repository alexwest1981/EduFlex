package com.eduflex.backend.controller;

import com.eduflex.backend.model.OrganizationBranding;
import com.eduflex.backend.service.BrandingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/branding")
public class BrandingController {

    private final BrandingService brandingService;

    public BrandingController(BrandingService brandingService) {
        this.brandingService = brandingService;
    }

    /**
     * Get branding for current organization (public endpoint for frontend to load branding)
     */
    @GetMapping
    public ResponseEntity<OrganizationBranding> getBranding(
            @RequestParam(defaultValue = "default") String organizationKey) {
        try {
            OrganizationBranding branding = brandingService.getBranding(organizationKey);
            return ResponseEntity.ok(branding);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all branding configurations (admin only, for multi-tenant management)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrganizationBranding>> getAllBrandings() {
        try {
            List<OrganizationBranding> brandings = brandingService.getAllBrandings();
            return ResponseEntity.ok(brandings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update branding configuration (admin only)
     */
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ett fel uppstod vid uppdatering av branding"));
        }
    }

    /**
     * Upload logo (admin only)
     */
    @PostMapping("/logo")
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
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
     * Check if user can access whitelabeling features
     */
    @GetMapping("/access")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> checkAccess() {
        boolean hasAccess = brandingService.canAccessWhitelabeling();
        return ResponseEntity.ok(Map.of("hasAccess", hasAccess));
    }
}
