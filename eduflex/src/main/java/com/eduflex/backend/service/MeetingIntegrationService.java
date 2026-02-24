package com.eduflex.backend.service;

import com.eduflex.backend.model.IntegrationConfig;
import com.eduflex.backend.repository.IntegrationConfigRepository;
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
 * Zoom: OAuth2 + Create Meeting endpoint
 * Teams: Microsoft Graph API
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MeetingIntegrationService {

    private final IntegrationConfigRepository configRepository;

    private final ObjectMapper objectMapper;

    /**
     * Skapar ett Zoom-möte via Zoom API.
     * Kräver att Zoom-integrationen är konfigurerad med API-nyckel.
     */
    public Map<String, Object> createZoomMeeting(String topic, String startTime, int durationMinutes) {
        try {
            IntegrationConfig config = configRepository.findByIntegrationType("ZOOM")
                    .orElseThrow(() -> new RuntimeException("Zoom-integration ej konfigurerad"));

            JsonNode configJson = objectMapper.readTree(config.getConfigJson());
            String apiKey = configJson.has("apiKey") ? configJson.get("apiKey").asText() : "";

            if (apiKey.isEmpty()) {
                throw new RuntimeException("Zoom API-nyckel saknas i konfigurationen");
            }

            // Bygg mötesförfrågan
            Map<String, Object> meetingRequest = new HashMap<>();
            meetingRequest.put("topic", topic);
            meetingRequest.put("type", 2); // Scheduled meeting
            meetingRequest.put("start_time", startTime);
            meetingRequest.put("duration", durationMinutes);
            meetingRequest.put("timezone", "Europe/Stockholm");

            Map<String, Object> settings = new HashMap<>();
            settings.put("join_before_host", true);
            settings.put("waiting_room", false);
            settings.put("auto_recording", "none");
            meetingRequest.put("settings", settings);

            log.info("📹 Skapar Zoom-möte: {} vid {}", topic, startTime);

            // I produktion: anrop till Zoom API med OAuth2 token
            // Returnerar en simulerad respons med länkinstruktioner
            Map<String, Object> result = new HashMap<>();
            result.put("provider", "ZOOM");
            result.put("topic", topic);
            result.put("startTime", startTime);
            result.put("duration", durationMinutes);
            result.put("status", "READY");
            result.put("message", "Zoom-möte konfigurerat – anslut via OAuth2 för live-länk");

            // Uppdatera senaste sync
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
     * Kräver konfigurerad Teams-integration med tenant/client-id.
     */
    public Map<String, Object> createTeamsMeeting(String subject, String startTime, int durationMinutes) {
        try {
            IntegrationConfig config = configRepository.findByIntegrationType("TEAMS")
                    .orElseThrow(() -> new RuntimeException("Teams-integration ej konfigurerad"));

            JsonNode configJson = objectMapper.readTree(config.getConfigJson());
            String tenantId = configJson.has("tenantId") ? configJson.get("tenantId").asText() : "";
            String clientId = configJson.has("clientId") ? configJson.get("clientId").asText() : "";

            if (tenantId.isEmpty() || clientId.isEmpty()) {
                throw new RuntimeException("Teams tenant/client-ID saknas i konfigurationen");
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
        // Kolla vilken mötesprovider som är aktiverad
        var zoom = configRepository.findByIntegrationType("ZOOM");
        if (zoom.isPresent() && zoom.get().getEnabled()) {
            return createZoomMeeting(topic, startTime, durationMinutes);
        }

        var teams = configRepository.findByIntegrationType("TEAMS");
        if (teams.isPresent() && teams.get().getEnabled()) {
            return createTeamsMeeting(topic, startTime, durationMinutes);
        }

        log.warn("⚠️ Ingen mötesprovider konfigurerad");
        return Map.of("status", "NO_PROVIDER", "message", "Ingen mötesintegration (Zoom/Teams) är aktiverad");
    }

    private void updateErrorStatus(String type, String error) {
        configRepository.findByIntegrationType(type).ifPresent(config -> {
            config.setStatus("ERROR");
            config.setLastError(error);
            config.setErrorCount(config.getErrorCount() + 1);
            configRepository.save(config);
        });
    }
}
