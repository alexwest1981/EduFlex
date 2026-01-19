package com.eduflex.backend.controller;

import com.eduflex.backend.service.LicenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system/license")
@CrossOrigin(origins = "*")
public class LicenseController {

    private final LicenseService licenseService;

    public LicenseController(LicenseService licenseService) {
        this.licenseService = licenseService;
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        try {
            Map<String, Object> response = new HashMap<>();

            // FIX: Anropar nu isValid()
            System.out.println("DEBUG: Checking license status...");
            boolean valid = licenseService.isValid();
            System.out.println("DEBUG: License valid? " + valid);

            if (valid) {
                response.put("status", "valid");
                response.put("tier", licenseService.getTier());
                response.put("customer", licenseService.getCustomerName());
                response.put("expiry", licenseService.getExpiryDate());
                response.put("daysRemaining", licenseService.getDaysRemaining());
                response.put("isExpiringSoon", licenseService.isExpiringSoon());
            } else {
                response.put("status", "locked");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ CRITICAL ERROR in LicenseController:");
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                    Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown Error", "trace", e.toString()));
        }
    }

    @PostMapping("/activate")
    public ResponseEntity<?> activate(@RequestBody Map<String, String> body) {
        String key = body.get("key");
        try {
            // FIX: Anropar nu activateLicense()
            licenseService.activateLicense(key);
            return ResponseEntity.ok(Map.of("message", "Licens aktiverad!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ogiltig licensnyckel"));
        }
    }

}