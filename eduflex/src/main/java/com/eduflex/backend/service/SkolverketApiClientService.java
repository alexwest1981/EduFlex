package com.eduflex.backend.service;

import com.eduflex.backend.integration.repository.IntegrationConfigRepository;
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
    // Skolverkets SusaNav (Utbildningsnavet) REST API
    private static final String SUSANAV_API_URL = "https://susanavet2.skolverket.se/api/v1";

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

    // --- SUSA-navet (Nationell Utbildningsintegration) ---

    /**
     * Hämtar en specifik kursplan eller utbildningsinfo från SUSA-navet.
     */
    public Object fetchCoursePlanFromSusaNav(String courseCode) {
        // Placeholder för SUSA-navets specifika endpoint för kursinfo
        String url = SUSANAV_API_URL + "/courses/" + courseCode;
        try {
            log.info("🔍 Hämta kursplan från SUSA-navet: {}", courseCode);
            ResponseEntity<Object> response = restTemplate.getForEntity(url, Object.class);
            return response.getBody();
        } catch (Exception e) {
            log.warn("⚠️ Kunde inte hämta från SUSA-navet (kod: {}): {}", courseCode, e.getMessage());
            return Map.of("error", "SusaNav fetch error: " + e.getMessage());
        }
    }

    /**
     * Söker fram utbildningspaket baserat på SUN-kod (Svensk
     * utbildningsnomenklatur).
     */
    public List<Map<String, Object>> fetchProgramBySunCode(String sunCode) {
        // Placeholder för SUSA-navets search endpoint by SUN-code
        String url = SUSANAV_API_URL + "/search?sunCode=" + sunCode;
        try {
            log.info("🔍 Söker utbildningspaket på SUSA-navet via SUN-kod: {}", sunCode);
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            return (List<Map<String, Object>>) response.getBody();
        } catch (Exception e) {
            log.warn("⚠️ SUSA-navet sökning via SUN-kod misslyckades (kod: {}): {}", sunCode, e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Exportera ett helt program till Skolverkets Utbildningsnav (SUSA-navet).
     * Detta är "Reverse Sync" som krävs för nationell integration.
     */
    public boolean publishProgramToSusaNav(com.eduflex.backend.model.EducationProgram program) {
        log.info("🚀 Genererar SUSA-navet export-payload för program: {} (SUN: {})",
                program.getName(), program.getSunCode());

        try {
            // Simulera payload-generering (JSON/XML enligt SusaNav Schema)
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "EDUCATION_PROGRAM");
            payload.put("external_id", "EDUFLEX-PROG-" + program.getId());
            payload.put("name", program.getName());
            payload.put("description", program.getDescription());
            payload.put("sunCode", program.getSunCode());
            payload.put("credits", program.getTotalCredits());

            List<Map<String, String>> courseNodes = program.getCourses().stream()
                    .map(c -> {
                        Map<String, String> node = new HashMap<>();
                        node.put("code", c.getCourseCode() != null ? c.getCourseCode() : "N/A");
                        node.put("name", c.getName());
                        node.put("points", String
                                .valueOf(c.getSkolverketCourse() != null ? c.getSkolverketCourse().getPoints() : 0));
                        return node;
                    })
                    .collect(java.util.stream.Collectors.toList());
            payload.put("courses", courseNodes);

            log.info("📦 SUSA-navet Payload genererad (Antal kurser: {})", courseNodes.size());
            // log.debug("Payload: {}", payload);

            // TODO: Anropa SUSANAV_API_URL via POST när certifikat finns
            log.info("✅ Programmet '{}' har simulerats för publicering till nationella navet.", program.getName());
            return true;
        } catch (Exception e) {
            log.error("❌ Export till SUSA-navet misslyckades: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Exportera en enskild kurs till Skolverkets Utbildningsnav.
     */
    public boolean publishCourseToSusaNav(Map<String, Object> courseData) {
        log.info("🚀 Förbereder publicering av enskild kurs till SUSA-navet: {}", courseData.get("name"));
        // Implementera riktig POST/PUT mot SUSA-navet här när certifikat/nycklar finns
        return true;
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
            configRepository.findByPlatform("SKOLVERKET").ifPresent(config -> {
                config.setLastSync(LocalDateTime.now());
                config.setStatus("CONNECTED");
                config.setActive(true);
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

            configRepository.findByPlatform("SKOLVERKET").ifPresent(config -> {
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
        return configRepository.findByPlatform("SKOLVERKET")
                .map(config -> {
                    Map<String, Object> status = new HashMap<>();
                    status.put("enabled", config.isActive());
                    status.put("status", config.getStatus());
                    status.put("lastSync", config.getLastSync() != null ? config.getLastSync().toString() : "Aldrig");
                    status.put("errorCount", config.getErrorCount());
                    status.put("lastError", config.getLastError());
                    return status;
                })
                .orElse(Map.of("status", "NOT_CONFIGURED"));
    }
}
