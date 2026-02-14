package com.eduflex.backend.controller;

import com.eduflex.backend.service.ImpactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/impact")
@Tag(name = "Impact Analysis", description = "Endpoints for measuring educational impact and ROI")
public class ImpactController {

    private final ImpactService impactService;

    public ImpactController(ImpactService impactService) {
        this.impactService = impactService;
    }

    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    @Operation(summary = "Get Impact Overview", description = "Aggregates outcome metrics for Elevhälsa and AI interventions.")
    public ResponseEntity<Map<String, Object>> getImpactOverview() {
        return ResponseEntity.ok(impactService.getSchoolOverview());
    }
}
