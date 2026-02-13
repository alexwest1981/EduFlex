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

    public PredictiveAnalyticsController(PredictiveAnalysisService predictiveAnalysisService) {
        this.predictiveAnalysisService = predictiveAnalysisService;
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
