package com.eduflex.backend.controller;

import com.eduflex.backend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        return ResponseEntity.ok(analyticsService.getSystemOverview());
    }

    @GetMapping("/growth")
    public ResponseEntity<List<Map<String, Object>>> getGrowth() {
        return ResponseEntity.ok(analyticsService.getUserGrowth());
    }

    @GetMapping("/engagement")
    public ResponseEntity<Map<String, Object>> getEngagement() {
        return ResponseEntity.ok(analyticsService.getEngagementStats());
    }

    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getStudentInsights() {
        return ResponseEntity.ok(analyticsService.getStudentInsights());
    }
}