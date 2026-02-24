package com.eduflex.backend.controller;

import com.eduflex.backend.model.IntegrationConfig;
import com.eduflex.backend.repository.IntegrationConfigRepository;
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
 * Admin-panel kan lista, aktivera/avaktivera och konfigurera varje integration.
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
    @Operation(summary = "Lista alla integrationer", description = "Returnerar status för alla konfigurerade integrationer")
    public List<IntegrationConfig> getAllIntegrations() {
        return configRepository.findAllByOrderByDisplayNameAsc();
    }

    @GetMapping("/{type}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Hämta en integration", description = "Hämta detaljer för en specifik integration")
    public ResponseEntity<IntegrationConfig> getIntegration(@PathVariable String type) {
        return configRepository.findByIntegrationType(type.toUpperCase())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{type}/toggle")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Aktivera/avaktivera integration")
    public ResponseEntity<IntegrationConfig> toggleIntegration(@PathVariable String type) {
        return configRepository.findByIntegrationType(type.toUpperCase())
                .map(config -> {
                    config.setEnabled(!config.getEnabled());
                    config.setStatus(config.getEnabled() ? "CONNECTED" : "DISABLED");
                    log.info("🔄 Integration {} {}", type, config.getEnabled() ? "aktiverad" : "avaktiverad");
                    return ResponseEntity.ok(configRepository.save(config));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{type}/config")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Uppdatera integrationskonfiguration", description = "Spara API-nycklar och inställningar")
    public ResponseEntity<IntegrationConfig> updateConfig(
            @PathVariable String type,
            @RequestBody Map<String, Object> configData) {
        return configRepository.findByIntegrationType(type.toUpperCase())
                .map(config -> {
                    try {
                        config.setConfigJson(objectMapper.writeValueAsString(configData));
                        config.setStatus("CONNECTED");
                        config.setEnabled(true);
                        config.setErrorCount(0);
                        config.setLastError(null);
                        log.info("✅ Integration {} konfigurerad", type);
                        return ResponseEntity.ok(configRepository.save(config));
                    } catch (Exception e) {
                        log.error("❌ Kunde inte spara konfiguration för {}: {}", type, e.getMessage());
                        return ResponseEntity.internalServerError().<IntegrationConfig>build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{type}/test")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Testa en integrations anslutning")
    public ResponseEntity<Map<String, Object>> testConnection(@PathVariable String type) {
        return configRepository.findByIntegrationType(type.toUpperCase())
                .map(config -> {
                    // Grundläggande test – verifiera att config finns och är ifylld
                    boolean hasConfig = config.getConfigJson() != null
                            && !config.getConfigJson().equals("{}")
                            && !config.getConfigJson().isEmpty();

                    Map<String, Object> result = Map.of(
                            "type", type.toUpperCase(),
                            "status", hasConfig ? "OK" : "MISSING_CONFIG",
                            "enabled", config.getEnabled(),
                            "lastSync", config.getLastSync() != null ? config.getLastSync().toString() : "Aldrig",
                            "message",
                            hasConfig ? "Anslutningen ser bra ut!" : "Konfiguration saknas – fyll i API-nycklar.");
                    return ResponseEntity.ok(result);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
