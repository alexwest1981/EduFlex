package com.eduflex.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.HashMap;

@Service
public class LicenseHeartbeatService {

    private static final Logger logger = LoggerFactory.getLogger(LicenseHeartbeatService.class);

    private final LicenseService licenseService;
    private final RestTemplate restTemplate;
    private static final String REPORT_URL = "https://api.eduflexlms.se/v1/license/report-invalid";

    public LicenseHeartbeatService(LicenseService licenseService) {
        this.licenseService = licenseService;
        this.restTemplate = new RestTemplate();
    }

    // Check status every 12 hours (more frequent for enforcement)
    @Scheduled(fixedRate = 5 * 60 * 1000) // Kontrollera var 5:e minut
    public void checkLicenseStatus() {
        if (licenseService.isOfflineMode()) {
            logger.debug("📴 License Heartbeat: Omhoppad (Offline Mode aktiv)");
            return;
        }

        try {
            // 1. Verifiera lokalt först
            licenseService.validateCurrentLicense();

            if (!licenseService.isValid()) {
                String msg = "🚨 HJÄRTAT SLÅR INTE: Licensen är ogiltig eller har gått ut! Systemet är låst.";
                logger.error(msg);
                licenseService.alertControlCenter(msg);
                return;
            }

            // 2. Skicka status-ping till Control Center även om den är giltig
            licenseService.alertControlCenter(
                    "💚 Licens OK: " + licenseService.getCustomerName() + " (" + licenseService.getTier() + ")");

            // 3. Valfritt: Fortsätt skicka till central server om man vill behålla extern
            // loggning
            /*
             * Map<String, String> request = new HashMap<>();
             * request.put("licenseKey", getLicenseKeyFromFile());
             * // ...
             */
        } catch (Exception e) {
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
            return java.nio.file.Files.readString(java.nio.file.Path.of("E:\\Projekt\\EduFlex\\eduflex.license"))
                    .trim();
        } catch (Exception e) {
            return "NO_FILE";
        }
    }
}
