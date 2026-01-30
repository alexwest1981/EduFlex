package com.eduflex.backend.controller;

import com.eduflex.backend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
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

    @GetMapping("/student/{studentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getStudentCourseProgress(@PathVariable Long studentId) {
        return ResponseEntity.ok(analyticsService.getStudentCourseProgress(studentId));
    }

    // --- NEW ENDPOINTS FOR DASHBOARD ---

    @GetMapping("/activity-trend")
    public ResponseEntity<List<Map<String, Object>>> getActivityTrend(
            @RequestParam(required = false, defaultValue = "30d") String range) {
        return ResponseEntity.ok(analyticsService.getActivityTrend(range));
    }

    @GetMapping("/course-performance")
    public ResponseEntity<List<Map<String, Object>>> getCoursePerformance() {
        return ResponseEntity.ok(analyticsService.getCoursePerformance());
    }

    @GetMapping("/at-risk-students")
    public ResponseEntity<List<Map<String, Object>>> getAtRiskStudents() {
        return ResponseEntity.ok(analyticsService.getAtRiskStudents());
    }

    @GetMapping("/heatmap")
    public ResponseEntity<Map<String, Integer>> getActivityHeatmap(
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(analyticsService.getActivityHeatmap(userId));
    }

    @GetMapping("/drop-off/{courseId}")
    public ResponseEntity<List<Map<String, Object>>> getCourseDropOff(@PathVariable Long courseId) {
        return ResponseEntity.ok(analyticsService.getCourseDropOff(courseId));
    }
}