package com.eduflex.backend.controller;

import com.eduflex.backend.model.LicenseType;
import com.eduflex.backend.service.LicenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@RestController
@RequestMapping("/api/system/license")
public class LicenseController {
    private static final Logger logger = LoggerFactory.getLogger(LicenseController.class);

    private final LicenseService licenseService;

    public LicenseController(LicenseService licenseService) {
        this.licenseService = licenseService;
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        try {
            boolean valid = licenseService.isValid();
            String tier = licenseService.getTier().name();
            return ResponseEntity.ok(Map.of("valid", valid, "tier", tier));
        } catch (Exception e) {
            logger.error("❌ License Status Error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage(), "trace", e.toString()));
        }
    }

    @PostMapping("/activate")
    public ResponseEntity<?> activateLicense(@RequestBody Map<String, String> payload) {
        try {
            String licenseKey = payload.get("licenseKey");
            boolean success = licenseService.verifyLicenseKey(licenseKey);
            return ResponseEntity.ok(Map.of("success", success));
        } catch (Exception e) {
            logger.error("❌ License Activation Error: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<?> heartbeat() {
        // Simple heartbeat endpoint to keep connection alive or validation active
        return ResponseEntity.ok(Map.of("status", "alive", "timestamp", System.currentTimeMillis()));
    }
}