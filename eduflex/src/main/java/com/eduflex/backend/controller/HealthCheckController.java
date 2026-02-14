package com.eduflex.backend.controller;

import com.eduflex.backend.service.HealthCheckService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/health")
@Tag(name = "Health Check", description = "System health and data integrity checks")
public class HealthCheckController {

    private final HealthCheckService healthCheckService;

    public HealthCheckController(HealthCheckService healthCheckService) {
        this.healthCheckService = healthCheckService;
    }

    @GetMapping("/data-integrity")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get Data Integrity Report", description = "Finds orphaned students, empty courses, and system stats.")
    public ResponseEntity<Map<String, Object>> getDataIntegrity() {
        return ResponseEntity.ok(healthCheckService.getDataIntegrityReport());
    }
}
