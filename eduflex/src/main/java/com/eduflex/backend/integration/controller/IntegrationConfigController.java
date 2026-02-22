package com.eduflex.backend.integration.controller;

import com.eduflex.backend.integration.model.IntegrationConfig;
import com.eduflex.backend.integration.repository.IntegrationConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin/integrations")
@RequiredArgsConstructor
public class IntegrationConfigController {

    private final IntegrationConfigRepository configRepository;

    @GetMapping("/{platform}")
    public ResponseEntity<IntegrationConfig> getConfig(@PathVariable String platform) {
        return configRepository.findByPlatform(platform.toUpperCase())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(new IntegrationConfig()));
    }

    @PostMapping("/{platform}")
    public ResponseEntity<IntegrationConfig> saveConfig(
            @PathVariable String platform,
            @RequestBody IntegrationConfig configData) {

        Optional<IntegrationConfig> existingOpt = configRepository.findByPlatform(platform.toUpperCase());
        IntegrationConfig config;

        if (existingOpt.isPresent()) {
            config = existingOpt.get();
        } else {
            config = new IntegrationConfig();
            config.setPlatform(platform.toUpperCase());
        }

        config.setWebhookUrl(configData.getWebhookUrl());
        config.setActive(configData.isActive());
        // config.setSettings(configData.getSettings()); // If we need more JSON
        // settings later

        return ResponseEntity.ok(configRepository.save(config));
    }
}
