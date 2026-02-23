package com.eduflex.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.net.InetAddress;
import java.util.Map;
import java.util.HashMap;

@Service
public class LicenseHeartbeatService {

    private static final Logger logger = LoggerFactory.getLogger(LicenseHeartbeatService.class);

    private final LicenseService licenseService;
    private final RestTemplate restTemplate;
    private static final String HEARTBEAT_URL = "https://api.eduflexlms.se/v1/license/heartbeat";
    private static final String REPORT_URL = "https://api.eduflexlms.se/v1/license/report-invalid";

    public LicenseHeartbeatService(LicenseService licenseService) {
        this.licenseService = licenseService;
        this.restTemplate = new RestTemplate();
    }

    // Check status every 12 hours (more frequent for enforcement)
    @Scheduled(fixedRate = 12 * 60 * 60 * 1000)
    public void checkLicenseStatus() {
        if (licenseService.isOfflineMode()) {
            logger.debug("📴 License Heartbeat: Omhoppad (Offline Mode aktiv)");
            return;
        }

        try {
            Map<String, String> request = new HashMap<>();
            request.put("licenseKey", getLicenseKeyFromFile());
            request.put("customer", licenseService.getCustomerName());
            request.put("ip", getPublicIp());
            request.put("hostname", InetAddress.getLocalHost().getHostName());

            ResponseEntity<Map> response = restTemplate.postForEntity(HEARTBEAT_URL, request, Map.class);
            Map<String, Object> body = (Map<String, Object>) response.getBody();

            if (body != null) {
                String status = (String) body.get("status");
                if ("UNPAID".equalsIgnoreCase(status) || "INVALID".equalsIgnoreCase(status)) {
                    licenseService.setSystemLocked(true);
                    reportInvalidUsage("Status: " + status);
                } else if ("VALID".equalsIgnoreCase(status) || "UP".equalsIgnoreCase(status)) {
                    licenseService.setSystemLocked(false);
                    logger.info("💓 License Heartbeat: Status OK för {}", licenseService.getCustomerName());
                }
            }

        } catch (Exception e) {
            // Heartbeat misslyckades – externt API kan vara nere, låter det passera tyst
            logger.debug("⚠️ License Heartbeat misslyckades: {}", e.getMessage());
        }
    }

    private void reportInvalidUsage(String reason) {
        try {
            Map<String, String> report = new HashMap<>();
            report.put("licenseKey", getLicenseKeyFromFile());
            report.put("ip", getPublicIp());
            report.put("reason", reason);
            restTemplate.postForEntity(REPORT_URL, report, Map.class);
            logger.warn("📢 Rapporterat ogiltig licensanvändning till EduFlex Central.");
        } catch (Exception e) {
            // Ignorera fel vid rapportering för att inte krascha tjänsten
        }
    }

    private String getPublicIp() {
        try {
            return restTemplate.getForObject("https://api.ipify.org", String.class);
        } catch (Exception e) {
            return "UNKNOWN";
        }
    }

    private String getLicenseKeyFromFile() {
        try {
            return java.nio.file.Files.readString(java.nio.file.Path.of("eduflex.license")).trim();
        } catch (Exception e) {
            return "NO_FILE";
        }
    }
}
