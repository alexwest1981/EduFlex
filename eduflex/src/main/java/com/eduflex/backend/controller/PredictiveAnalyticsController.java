package com.eduflex.backend.controller;

import com.eduflex.backend.model.StudentRiskFlag;
import com.eduflex.backend.service.PredictiveAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics/predictive")
public class PredictiveAnalyticsController {

    private final PredictiveAnalysisService predictiveAnalysisService;
    private final com.eduflex.backend.service.AICoachingService aiCoachingService;

    public PredictiveAnalyticsController(PredictiveAnalysisService predictiveAnalysisService,
            com.eduflex.backend.service.AICoachingService aiCoachingService) {
        this.predictiveAnalysisService = predictiveAnalysisService;
        this.aiCoachingService = aiCoachingService;
    }

    @GetMapping("/coach/principal")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<Map<String, Object>> getPrincipalCoach() {
        return ResponseEntity.ok(aiCoachingService.getPrincipalWeeklyFocus());
    }

    @GetMapping("/coach/mentor/{mentorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PRINCIPAL')")
    public ResponseEntity<Map<String, Object>> getMentorCoach(@PathVariable Long mentorId) {
        return ResponseEntity.ok(aiCoachingService.getMentorStudentOverview(mentorId));
    }

    @GetMapping("/high-risk")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PRINCIPAL')")
    public ResponseEntity<List<StudentRiskFlag>> getHighRiskFlags() {
        return ResponseEntity.ok(predictiveAnalysisService.getHighRiskStudents());
    }

    @GetMapping("/mentor/{mentorId}/high-risk")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PRINCIPAL')")
    public ResponseEntity<List<StudentRiskFlag>> getHighRiskFlagsForMentor(@PathVariable Long mentorId) {
        return ResponseEntity.ok(predictiveAnalysisService.getHighRiskStudentsForMentor(mentorId));
    }

    @PostMapping("/analyze/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PRINCIPAL')")
    public ResponseEntity<StudentRiskFlag> analyzeStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(predictiveAnalysisService.analyzeStudentRisk(studentId));
    }

    @PostMapping("/analyze-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> analyzeAll() {
        predictiveAnalysisService.analyzeAllStudents();
        return ResponseEntity.ok(Map.of("message", "Batch analysis started"));
    }
}
