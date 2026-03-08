package com.eduflex.backend.controller;

import com.eduflex.backend.model.CourseEnrollmentDetails;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseEnrollmentDetailsRepository;
import com.eduflex.backend.service.MyhComplianceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/compliance")
@RequiredArgsConstructor
@Slf4j
public class ComplianceController {

    private final CourseEnrollmentDetailsRepository enrollmentRepository;
    private final MyhComplianceService myhComplianceService;

    /**
     * Endpoint for the LIA Radar in the Principal/Admin Dashboard.
     * Returns a list of MYH compliance warnings regarding ongoing or upcoming LIA
     * placements.
     */
    @GetMapping("/lia-radar")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<List<Map<String, Object>>> getLiaRadarWarnings() {
        log.info("Fetching LIA Radar warnings for Admin Dashboard...");
        List<Map<String, Object>> warnings = myhComplianceService.getComplianceWarnings();
        return ResponseEntity.ok(warnings);
    }

    /**
     * Endpoint for the Ghosting Radar in the Principal/Admin Dashboard.
     * Returns a list of active students who have been inactive for more than 10
     * days.
     */
    @GetMapping("/ghosting-radar")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<List<Map<String, Object>>> getGhostingRadarWarnings() {
        log.info("Fetching Ghosting Radar warnings for Admin Dashboard...");
        List<CourseEnrollmentDetails> activeEnrollments = enrollmentRepository
                .findByStatus(CourseEnrollmentDetails.EnrollmentStatus.ACTIVE);

        LocalDateTime now = LocalDateTime.now();
        List<Map<String, Object>> warnings = new ArrayList<>();

        for (CourseEnrollmentDetails enrollment : activeEnrollments) {
            User student = enrollment.getStudent();
            LocalDateTime lastActive = student.getLastActive() != null ? student.getLastActive()
                    : enrollment.getEnrolledAt();

            long daysInactive = ChronoUnit.DAYS.between(lastActive, now);

            if (daysInactive >= 10) {
                Map<String, Object> warning = new HashMap<>();
                warning.put("studentId", student.getId());
                warning.put("studentName", student.getFullName());
                warning.put("ssn", student.getSsn());
                warning.put("courseId", enrollment.getCourse().getId());
                warning.put("courseCode", enrollment.getCourse().getCourseCode());
                warning.put("courseName", enrollment.getCourse().getName());
                warning.put("daysInactive", daysInactive);
                warning.put("warningLevel", daysInactive >= 20 ? "RED" : "YELLOW");
                warning.put("suggestedAction",
                        daysInactive >= 20 ? "Trigger CSN Code 99 (Avbrott)" : "Send AI Motivational Ping");
                warning.put("enrolledAt", enrollment.getEnrolledAt());

                warnings.add(warning);
            }
        }

        // Sortera så att de med flest dagar inaktiva hamnar överst (allvarligast först)
        warnings.sort((w1, w2) -> Long.compare((Long) w2.get("daysInactive"), (Long) w1.get("daysInactive")));

        return ResponseEntity.ok(warnings);
    }
}
