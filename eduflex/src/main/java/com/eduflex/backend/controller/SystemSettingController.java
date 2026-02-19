package com.eduflex.backend.controller;

import com.eduflex.backend.model.SystemSetting;
import com.eduflex.backend.service.SystemSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SystemSettingController {

    private final SystemSettingService service;

    public SystemSettingController(SystemSettingService service) {
        this.service = service;
    }

    @GetMapping
    public List<SystemSetting> getSettings() {
        return service.getAllSettings();
    }

    @PutMapping("/{key}")
    public ResponseEntity<SystemSetting> updateSetting(@PathVariable String key,
            @RequestBody Map<String, String> payload) {
        String newValue = payload.get("value");
        return ResponseEntity.ok(service.updateSetting(key, newValue));
    }
}