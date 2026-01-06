package com.eduflex.backend.controller;

import com.eduflex.backend.dto.AnalyticsDTO;
import com.eduflex.backend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    // @PreAuthorize("hasRole('ADMIN')") // Avkommentera om du vill låsa till Admin
    public ResponseEntity<AnalyticsDTO> getOverview() {
        return ResponseEntity.ok(analyticsService.getSystemOverview());
    }
}