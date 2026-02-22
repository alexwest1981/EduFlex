package com.eduflex.backend.controller;

import com.eduflex.backend.service.DemoDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/demo")
@Tag(name = "Demo Data Management", description = "APIs for provisioning and resetting demo environments")
public class DemoDataController {

    private final DemoDataService demoDataService;

    @Autowired
    public DemoDataController(DemoDataService demoDataService) {
        this.demoDataService = demoDataService;
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate Swedish Demo Data", description = "Populates the current tenant with realistic Swedish users, courses, and analytics.")
    public ResponseEntity<?> generateData() {
        try {
            demoDataService.generateSwedishDemoData();
            return ResponseEntity.ok(Map.of("message", "Demo data generated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to generate demo data: " + e.getMessage()));
        }
    }
}
