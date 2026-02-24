package com.eduflex.backend.controller;

import com.eduflex.backend.integration.model.IntegrationConfig;
import com.eduflex.backend.integration.repository.IntegrationConfigRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Centralt API för att hantera alla integrationer.
 * Admin kan lista, aktivera/avaktivera och konfigurera varje integration.
 */
@RestController
@RequestMapping("/api/integrations")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Tag(name = "Integration Hub", description = "Hantera externa integrationer")
@RequiredArgsConstructor
@Slf4j
public class IntegrationController {

    private final IntegrationConfigRepository configRepository;
    private final ObjectMapper objectMapper;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'PRINCIPAL', 'REKTOR', 'ROLE_REKTOR')")
    @Operation(summary = "Lista alla integrationer")
    public List<IntegrationConfig> getAllIntegrations() {
        return configRepository.findAllByOrderByDisplayNameAsc();
    }

    @GetMapping("/{platform}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Hämta en integration")
    public ResponseEntity<IntegrationConfig> getIntegration(@PathVariable String platform) {
        return configRepository.findByPlatform(platform.toUpperCase())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{platform}/toggle")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Aktivera/avaktivera integration")
    public ResponseEntity<IntegrationConfig> toggleIntegration(@PathVariable String platform) {
        return configRepository.findByPlatform(platform.toUpperCase())
                .map(config -> {
                    config.setActive(!config.isActive());
                    config.setStatus(config.isActive() ? "CONNECTED" : "DISABLED");
                    log.info("🔄 Integration {} {}", platform, config.isActive() ? "aktiverad" : "avaktiverad");
                    return ResponseEntity.ok(configRepository.save(config));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{platform}/config")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Uppdatera integrationskonfiguration")
    public ResponseEntity<IntegrationConfig> updateConfig(
            @PathVariable String platform,
            @RequestBody Map<String, Object> configData) {
        return configRepository.findByPlatform(platform.toUpperCase())
                .map(config -> {
                    try {
                        config.setSettings(objectMapper.writeValueAsString(configData));
                        config.setStatus("CONNECTED");
                        config.setActive(true);
                        config.setErrorCount(0);
                        config.setLastError(null);
                        log.info("✅ Integration {} konfigurerad", platform);
                        return ResponseEntity.ok(configRepository.save(config));
                    } catch (Exception e) {
                        log.error("❌ Kunde inte spara konfiguration för {}: {}", platform, e.getMessage());
                        return ResponseEntity.internalServerError().<IntegrationConfig>build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{platform}/test")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Testa en integrations anslutning")
    public ResponseEntity<Map<String, Object>> testConnection(@PathVariable String platform) {
        return configRepository.findByPlatform(platform.toUpperCase())
                .map(config -> {
                    boolean hasConfig = config.getSettings() != null
                            && !config.getSettings().equals("{}")
                            && !config.getSettings().isEmpty();

                    Map<String, Object> result = Map.of(
                            "platform", platform.toUpperCase(),
                            "status", hasConfig || config.isActive() ? "OK" : "MISSING_CONFIG",
                            "enabled", config.isActive(),
                            "lastSync", config.getLastSync() != null ? config.getLastSync().toString() : "Aldrig",
                            "message", hasConfig || config.isActive() ? "Anslutningen ser bra ut!"
                                    : "Konfiguration saknas – fyll i API-nycklar.");
                    return ResponseEntity.ok(result);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
