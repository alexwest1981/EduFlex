package com.eduflex.backend.service;

import com.eduflex.backend.repository.IntegrationConfigRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Klient för Skolverkets kursplans-API.
 * Hämtar ämnen, kursplaner och betygskriterier.
 * Stödjer batch-import av alla ämnen till systemet.
 */
@Service
@Slf4j
public class SkolverketApiClientService {

    private final RestTemplate restTemplate;
    private final IntegrationConfigRepository configRepository;
    private static final String API_BASE_URL = "https://api.skolverket.se/syllabus/v1";

    public SkolverketApiClientService(IntegrationConfigRepository configRepository) {
        this.restTemplate = new RestTemplate();
        this.configRepository = configRepository;
    }

    public Object getAllSubjects() {
        String url = API_BASE_URL + "/subjects";
        ResponseEntity<Object> response = restTemplate.getForEntity(url, Object.class);
        return response.getBody();
    }

    public Object getSubject(String code) {
        String url = API_BASE_URL + "/subjects/" + code;
        try {
            ResponseEntity<Object> response = restTemplate.getForEntity(url, Object.class);
            return response.getBody();
        } catch (Exception e) {
            return Map.of("error", "Subject not found or API error: " + e.getMessage());
        }
    }

    /**
     * Batch-importerar alla ämnen från Skolverkets API.
     * Returnerar antal hämtade ämnen och synk-status.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> batchImportSubjects() {
        try {
            log.info("📚 Startar batch-import från Skolverket...");
            Object allSubjects = getAllSubjects();

            int count = 0;
            if (allSubjects instanceof List) {
                count = ((List<?>) allSubjects).size();
            } else if (allSubjects instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) allSubjects;
                if (map.containsKey("subjects")) {
                    Object subjects = map.get("subjects");
                    if (subjects instanceof List) {
                        count = ((List<?>) subjects).size();
                    }
                }
            }

            // Uppdatera synk-status
            configRepository.findByIntegrationType("SKOLVERKET").ifPresent(config -> {
                config.setLastSync(LocalDateTime.now());
                config.setStatus("CONNECTED");
                config.setEnabled(true);
                config.setErrorCount(0);
                config.setLastError(null);
                configRepository.save(config);
            });

            log.info("✅ Skolverket-synk klar: {} ämnen hämtade", count);

            return Map.of(
                    "status", "SUCCESS",
                    "subjectsCount", count,
                    "syncedAt", LocalDateTime.now().toString(),
                    "message", String.format("Hämtade %d ämnen från Skolverkets API", count));

        } catch (Exception e) {
            log.error("❌ Skolverket batch-import misslyckades: {}", e.getMessage());

            configRepository.findByIntegrationType("SKOLVERKET").ifPresent(config -> {
                config.setStatus("ERROR");
                config.setLastError(e.getMessage());
                config.setErrorCount(config.getErrorCount() + 1);
                configRepository.save(config);
            });

            return Map.of("status", "ERROR", "message", "Import misslyckades: " + e.getMessage());
        }
    }

    /**
     * Returnerar aktuell synk-status för Skolverket-integrationen.
     */
    public Map<String, Object> getSyncStatus() {
        return configRepository.findByIntegrationType("SKOLVERKET")
                .map(config -> {
                    Map<String, Object> status = new HashMap<>();
                    status.put("enabled", config.getEnabled());
                    status.put("status", config.getStatus());
                    status.put("lastSync", config.getLastSync() != null ? config.getLastSync().toString() : "Aldrig");
                    status.put("errorCount", config.getErrorCount());
                    status.put("lastError", config.getLastError());
                    return status;
                })
                .orElse(Map.of("status", "NOT_CONFIGURED"));
    }
}
