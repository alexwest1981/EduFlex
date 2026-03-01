package com.eduflex.backend.controller;

import com.eduflex.backend.model.SystemSetting;
import com.eduflex.backend.service.SystemSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SystemSettingController {
    private static final Logger logger = LoggerFactory.getLogger(SystemSettingController.class);

    private final SystemSettingService service;

    public SystemSettingController(SystemSettingService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> getSettings() {
        try {
            return ResponseEntity.ok(service.getAllSettings());
        } catch (Exception e) {
            logger.error("❌ SystemSetting Error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage(), "trace", e.toString()));
        }
    }

    @PutMapping("/{key}")
    public ResponseEntity<?> updateSetting(@PathVariable String key,
            @RequestBody Map<String, String> payload) {
        try {
            String newValue = payload.get("value");
            return ResponseEntity.ok(service.updateSetting(key, newValue));
        } catch (Exception e) {
            logger.error("❌ UpdateSetting Error for {}: {}", key, e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}