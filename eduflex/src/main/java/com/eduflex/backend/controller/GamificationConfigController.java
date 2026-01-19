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
    public ResponseEntity<GamificationConfig> getConfig(@PathVariable Long organizationId) {
        GamificationConfig config = configService.getConfig(organizationId);
        return ResponseEntity.ok(config);
    }

    /**
     * Get system-wide config
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
    public ResponseEntity<Map<String, Boolean>> isEnabled(@PathVariable Long organizationId) {
        boolean enabled = configService.isEnabled(organizationId);
        return ResponseEntity.ok(Map.of("enabled", enabled));
    }

    /**
     * Update gamification config
     */
    @PutMapping("/{organizationId}")
    public ResponseEntity<GamificationConfig> updateConfig(
            @PathVariable Long organizationId,
            @RequestBody GamificationConfig config) {
        // config.setOrganizationId(organizationId); // TODO: Add organizationId field
        // to GamificationConfig model
        GamificationConfig updated = configService.updateConfig(config);
        return ResponseEntity.ok(updated);
    }
}
