package com.eduflex.backend.controller;

import com.eduflex.backend.model.SystemModule;
import com.eduflex.backend.service.ModuleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/modules")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ModuleController {

    private final ModuleService moduleService;

    public ModuleController(ModuleService moduleService) {
        this.moduleService = moduleService;
    }

    @GetMapping
    public ResponseEntity<List<SystemModule>> getAllModules() {
        return ResponseEntity.ok(moduleService.getAllModules());
    }

    @PutMapping("/{key}/toggle")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<SystemModule> toggleModule(@PathVariable String key,
            @RequestBody Map<String, Boolean> payload) {
        // Vi hämtar "active" från JSON-payloaden
        return ResponseEntity.ok(moduleService.toggleModule(key, payload.get("active")));
    }

    /**
     * Manually trigger module initialization (creates missing modules).
     * Useful if @PostConstruct didn't run properly.
     */
    @PostMapping("/init")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> initializeModules() {
        moduleService.initModules();
        List<SystemModule> modules = moduleService.getAllModules();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Modules initialized successfully",
                "moduleCount", modules.size(),
                "modules", modules.stream().map(SystemModule::getModuleKey).toList()
        ));
    }
}