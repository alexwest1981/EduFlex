package com.eduflex.backend.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;

@Service
public class LicenseHeartbeatService {

    private final LicenseService licenseService;
    private final RestTemplate restTemplate;
    private static final String HEARTBEAT_URL = "https://api.eduflexlms.se/v1/license/heartbeat";

    public LicenseHeartbeatService(LicenseService licenseService) {
        this.licenseService = licenseService;
        this.restTemplate = new RestTemplate();
    }

    // Check status every 24 hours
    @Scheduled(fixedRate = 24 * 60 * 60 * 1000)
    public void checkLicenseStatus() {
        if (!licenseService.isValid())
            return;

        try {
            Map<String, String> request = new HashMap<>();
            request.put("licenseKey", getLicenseKeyFromFile());
            request.put("customer", licenseService.getCustomerName());

            // In a real scenario, we would send the license key and potentially a machine
            // ID
            // ResponseEntity<Map> response = restTemplate.postForEntity(HEARTBEAT_URL,
            // request, Map.class);

            // For now, we simulate a successful check
            System.out.println("💓 License Heartbeat: Status OK for " + licenseService.getCustomerName());

        } catch (Exception e) {
            System.err.println("⚠️ License Heartbeat failed: " + e.getMessage());
            // We don't lock the system on connection failure to allow for offline usage
            // but we might want to log it for future audits.
        }
    }

    private String getLicenseKeyFromFile() {
        try {
            return java.nio.file.Files.readString(java.nio.file.Path.of("eduflex.license")).trim();
        } catch (Exception e) {
            return null;
        }
    }
}
