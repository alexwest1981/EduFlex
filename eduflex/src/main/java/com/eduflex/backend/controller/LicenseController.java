package com.eduflex.backend.controller;

import com.eduflex.backend.service.LicenseService;
import com.eduflex.backend.model.LicenseType;
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
        Map<String, Object> response = new HashMap<>();

        // FIX: Anropar nu isValid()
        if (licenseService.isValid()) {
            response.put("status", "valid");
            response.put("tier", licenseService.getTier());
            response.put("customer", licenseService.getCustomerName());
            response.put("expiry", licenseService.getExpiryDate());
        } else {
            response.put("status", "locked");
        }
        return ResponseEntity.ok(response);
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

    @GetMapping("/generate")
    public ResponseEntity<String> generate(
            @RequestParam String customer,
            @RequestParam LicenseType tier,
            @RequestParam int days) {
        try {
            String key = licenseService.generateLicenseKey(customer, tier, days);
            return ResponseEntity.ok(key);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}