package com.eduflex.backend.controller;

import com.eduflex.backend.service.XApiAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/teacher/analytics")
@CrossOrigin(origins = "*")
@Tag(name = "Teacher Analytics", description = "Endpoints for teacher dashboards.")
public class TeacherController {

    private final XApiAnalyticsService analyticsService;

    public TeacherController(XApiAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/course/{coursePrefix}")
    @Operation(summary = "Get Course Analytics", description = "Returns aggregated xAPI data for a course.")
    public ResponseEntity<Map<String, Object>> getCourseAnalytics(@PathVariable String coursePrefix) {
        Map<String, Object> data = analyticsService.getCourseAnalytics(coursePrefix);
        return ResponseEntity.ok(data);
    }
}
