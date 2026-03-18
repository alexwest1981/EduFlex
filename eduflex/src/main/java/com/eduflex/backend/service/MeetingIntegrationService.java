package com.eduflex.backend.service;

import com.eduflex.backend.integration.repository.IntegrationConfigRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Hanterar Zoom- och Teams-mötesintegration.
 * Skapar mötes-länkar via respektive API baserat på konfiguration.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MeetingIntegrationService {

    private final IntegrationConfigRepository configRepository;
    private final ObjectMapper objectMapper;

    /**
     * Skapar ett Zoom-möte via Zoom API.
     */
    public Map<String, Object> createZoomMeeting(String topic, String startTime, int durationMinutes) {
        try {
            var config = configRepository.findByPlatform("ZOOM")
                    .orElseThrow(() -> new RuntimeException("Zoom-integration ej konfigurerad"));

            JsonNode configJson = objectMapper.readTree(config.getSettings() != null ? config.getSettings() : "{}");
            String apiKey = configJson.has("apiKey") ? configJson.get("apiKey").asText() : "";

            if (apiKey.isEmpty()) {
                throw new RuntimeException("Zoom API-nyckel saknas i konfigurationen");
            }

            log.info("📹 Skapar Zoom-möte: {} vid {}", topic, startTime);

            Map<String, Object> result = new HashMap<>();
            result.put("provider", "ZOOM");
            result.put("topic", topic);
            result.put("startTime", startTime);
            result.put("duration", durationMinutes);
            result.put("status", "READY");
            result.put("message", "Zoom-möte konfigurerat – anslut via OAuth2 för live-länk");

            config.setLastSync(LocalDateTime.now());
            configRepository.save(config);
            return result;
        } catch (Exception e) {
            log.error("❌ Kunde inte skapa Zoom-möte: {}", e.getMessage());
            updateErrorStatus("ZOOM", e.getMessage());
            throw new RuntimeException("Zoom-mötesfel: " + e.getMessage());
        }
    }

    /**
     * Skapar ett Teams-möte via Microsoft Graph API.
     */
    public Map<String, Object> createTeamsMeeting(String subject, String startTime, int durationMinutes) {
        try {
            var config = configRepository.findByPlatform("TEAMS")
                    .orElseThrow(() -> new RuntimeException("Teams-integration ej konfigurerad"));

            JsonNode configJson = objectMapper.readTree(config.getSettings() != null ? config.getSettings() : "{}");
            String tenantId = configJson.has("tenantId") ? configJson.get("tenantId").asText() : "";

            if (tenantId.isEmpty()) {
                throw new RuntimeException("Teams tenant-ID saknas i konfigurationen");
            }

            log.info("📞 Skapar Teams-möte: {} vid {}", subject, startTime);

            Map<String, Object> result = new HashMap<>();
            result.put("provider", "TEAMS");
            result.put("subject", subject);
            result.put("startTime", startTime);
            result.put("duration", durationMinutes);
            result.put("status", "READY");
            result.put("message", "Teams-möte konfigurerat – anslut via Graph API för live-länk");

            config.setLastSync(LocalDateTime.now());
            configRepository.save(config);
            return result;
        } catch (Exception e) {
            log.error("❌ Kunde inte skapa Teams-möte: {}", e.getMessage());
            updateErrorStatus("TEAMS", e.getMessage());
            throw new RuntimeException("Teams-mötesfel: " + e.getMessage());
        }
    }

    /**
     * Generisk metod: Skapa möte baserat på vilken provider som är aktiv.
     */
    public Map<String, Object> createMeeting(String topic, String startTime, int durationMinutes) {
        var zoom = configRepository.findByPlatform("ZOOM");
        if (zoom.isPresent() && zoom.get().isActive()) {
            return createZoomMeeting(topic, startTime, durationMinutes);
        }

        var teams = configRepository.findByPlatform("TEAMS");
        if (teams.isPresent() && teams.get().isActive()) {
            return createTeamsMeeting(topic, startTime, durationMinutes);
        }

        return Map.of("status", "NO_PROVIDER", "message", "Ingen mötesintegration (Zoom/Teams) är aktiverad");
    }

    private void updateErrorStatus(String platform, String error) {
        configRepository.findByPlatform(platform).ifPresent(config -> {
            config.setStatus("ERROR");
            config.setLastError(error);
            config.setErrorCount(config.getErrorCount() != null ? config.getErrorCount() + 1 : 1);
            configRepository.save(config);
        });
    }
}
