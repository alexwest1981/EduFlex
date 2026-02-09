package com.eduflex.backend.controller;

import com.eduflex.backend.model.IncidentReport;
import com.eduflex.backend.model.StaffObservation;
import com.eduflex.backend.model.User;
import com.eduflex.backend.service.QualityAndSafetyService;
import com.eduflex.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/quality")
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
public class QualityAndSafetyController {

    private final QualityAndSafetyService qualityAndSafetyService;
    private final UserService userService;

    public QualityAndSafetyController(QualityAndSafetyService qualityAndSafetyService, UserService userService) {
        this.qualityAndSafetyService = qualityAndSafetyService;
        this.userService = userService;
    }

    // --- Incidents ---
    @PostMapping("/incidents")
    public ResponseEntity<IncidentReport> reportIncident(@RequestBody IncidentReport report, @AuthenticationPrincipal String username) {
        User reporter = userService.getUserByUsername(username);
        report.setReporter(reporter);
        return ResponseEntity.ok(qualityAndSafetyService.reportIncident(report));
    }

    @GetMapping("/incidents")
    public ResponseEntity<List<IncidentReport>> getAllIncidents() {
        return ResponseEntity.ok(qualityAndSafetyService.getAllIncidents());
    }

    @PatchMapping("/incidents/{id}")
    public ResponseEntity<IncidentReport> updateIncident(@PathVariable Long id, @RequestParam IncidentReport.Status status, 
                                                         @RequestParam(required = false) String notes, 
                                                         @RequestParam(required = false) String actions) {
        return ResponseEntity.ok(qualityAndSafetyService.updateIncidentStatus(id, status, notes, actions));
    }

    // --- Observations ---
    @PostMapping("/observations")
    public ResponseEntity<StaffObservation> recordObservation(@RequestBody StaffObservation observation, @AuthenticationPrincipal String username) {
        User observer = userService.getUserByUsername(username);
        observation.setObserver(observer);
        return ResponseEntity.ok(qualityAndSafetyService.recordObservation(observation));
    }

    @GetMapping("/observations/teacher/{teacherId}")
    public ResponseEntity<List<StaffObservation>> getObservations(@PathVariable Long teacherId) {
        return ResponseEntity.ok(qualityAndSafetyService.getObservationsForTeacher(teacherId));
    }
}
