package com.eduflex.backend.controller;

import com.eduflex.backend.model.GamificationConfig;
import com.eduflex.backend.service.GamificationConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gamification/config")
@CrossOrigin(origins = "*")
public class GamificationConfigController {

    @Autowired
    private GamificationConfigService configService;

    /**
     * Get gamification config for organization
     */
    @GetMapping("/{organizationId}")
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    public ResponseEntity<GamificationConfig> getConfig(@PathVariable Long organizationId) {
        GamificationConfig config = configService.getConfig(organizationId);
        return ResponseEntity.ok(config);
    }

    /**
     * Get system-wide config (public endpoint - no authentication required)
     */
    @GetMapping("/system")
    public ResponseEntity<GamificationConfig> getSystemConfig() {
        GamificationConfig config = configService.getConfig(null);
        return ResponseEntity.ok(config);
    }

    /**
     * Check if gamification is enabled
     */
    @GetMapping("/{organizationId}/enabled")
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> isEnabled(@PathVariable Long organizationId) {
        boolean enabled = configService.isEnabled(organizationId);
        return ResponseEntity.ok(Map.of("enabled", enabled));
    }

    /**
     * Update gamification config (admin only)
     */
    @PutMapping("/{organizationId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<GamificationConfig> updateConfig(
            @PathVariable Long organizationId,
            @RequestBody GamificationConfig config) {
        // config.setOrganizationId(organizationId); // TODO: Add organizationId field
        // to GamificationConfig model
        GamificationConfig updated = configService.updateConfig(config);
        return ResponseEntity.ok(updated);
    }
}
