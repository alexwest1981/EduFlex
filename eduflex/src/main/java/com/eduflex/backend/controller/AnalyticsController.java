package com.eduflex.backend.controller;

import com.eduflex.backend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview(
            @RequestParam(required = false, defaultValue = "month") String range) {
        return ResponseEntity.ok(analyticsService.getSystemOverview(range));
    }

    @GetMapping("/growth")
    public ResponseEntity<List<Map<String, Object>>> getGrowth(
            @RequestParam(required = false, defaultValue = "month") String range) {
        return ResponseEntity.ok(analyticsService.getUserGrowth(range));
    }

    @GetMapping("/engagement")
    public ResponseEntity<Map<String, Object>> getEngagement() {
        return ResponseEntity.ok(analyticsService.getEngagementStats());
    }

    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getStudentInsights() {
        return ResponseEntity.ok(analyticsService.getStudentInsights());
    }

    @GetMapping("/csn-report")
    public ResponseEntity<List<Map<String, Object>>> getCSNReport() {
        // Enbart PRINCIPAL/ADMIN borde nå denna
        return ResponseEntity.ok(analyticsService.getCSNReport());
    }

    @GetMapping("/my-status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getMyStatus(@RequestParam Long studentId) {
        // I en riktig impl, hämta studentId från SecurityContext
        return ResponseEntity.ok(analyticsService.getStudentSelfStatus(studentId));
    }
}