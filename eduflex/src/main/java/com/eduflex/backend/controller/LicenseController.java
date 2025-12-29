package com.eduflex.backend.controller;

import com.eduflex.backend.service.LicenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/system/license")
public class LicenseController {

    private final LicenseService licenseService;

    public LicenseController(LicenseService licenseService) {
        this.licenseService = licenseService;
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        if (licenseService.isSystemActive()) {
            return ResponseEntity.ok(Map.of("status", "valid"));
        } else {
            return ResponseEntity.ok(Map.of("status", "locked"));
        }
    }

    @PostMapping("/activate")
    public ResponseEntity<?> activate(@RequestBody Map<String, String> body) {
        String key = body.get("key");
        boolean success = licenseService.activate(key);

        if (success) {
            return ResponseEntity.ok(Map.of("message", "License activated"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid license key"));
        }
    }
}