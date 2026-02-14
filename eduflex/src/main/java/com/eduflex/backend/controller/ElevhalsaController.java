package com.eduflex.backend.controller;

import com.eduflex.backend.model.ElevhalsaCase;
import com.eduflex.backend.service.ElevhalsaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/elevhalsa")
public class ElevhalsaController {

    @Autowired
    private ElevhalsaService elevhalsaService;

    @GetMapping("/metrics")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        return ResponseEntity.ok(elevhalsaService.getMetrics());
    }

    @GetMapping("/risks")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<List<Map<String, Object>>> getRisks() {
        return ResponseEntity.ok(elevhalsaService.getAtRiskStudents());
    }

    @GetMapping("/cases")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<List<ElevhalsaCase>> getCases() {
        return ResponseEntity.ok(elevhalsaService.getAllCases());
    }

    @PostMapping("/cases")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<ElevhalsaCase> createCase(@RequestBody ElevhalsaCase healthCase) {
        return ResponseEntity.ok(elevhalsaService.createCase(healthCase));
    }

    @GetMapping("/wellbeing/drilldown")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<Map<String, Object>> getWellbeingDrilldown() {
        return ResponseEntity.ok(elevhalsaService.getWellbeingDrilldown());
    }

    // --- Journal System ---

    @PostMapping("/cases/{id}/journal")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<com.eduflex.backend.model.ElevhalsaJournalEntry> addJournalEntry(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.eduflex.backend.model.User user) {

        return ResponseEntity.ok(elevhalsaService.addJournalEntry(
                id,
                user,
                body.get("content"),
                body.get("visibility")));
    }

    @GetMapping("/cases/{id}/journal")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'HALSOTEAM', 'ROLE_HALSOTEAM', 'STUDENT', 'ROLE_STUDENT', 'GUARDIAN', 'ROLE_GUARDIAN')")
    public ResponseEntity<List<com.eduflex.backend.model.ElevhalsaJournalEntry>> getCaseJournal(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.eduflex.backend.model.User user) {

        return ResponseEntity.ok(elevhalsaService.getCaseJournal(id, user));
    }

    // --- Booking System ---

    @PostMapping("/bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.eduflex.backend.model.ElevhalsaBooking> createBooking(
            @RequestBody Map<String, String> body) {
        Long studentId = Long.parseLong(body.get("studentId"));
        Long staffId = body.containsKey("staffId") ? Long.parseLong(body.get("staffId")) : null;
        java.time.LocalDateTime start = java.time.LocalDateTime.parse(body.get("startTime"));
        java.time.LocalDateTime end = java.time.LocalDateTime.parse(body.get("endTime"));

        return ResponseEntity.ok(elevhalsaService.createBooking(
                studentId,
                staffId,
                start,
                end,
                body.get("type"),
                body.get("notes")));
    }

    @GetMapping("/bookings/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<com.eduflex.backend.model.ElevhalsaBooking>> getMyBookings(@RequestParam Long userId,
            @RequestParam String role) {
        if (role.toUpperCase().contains("STUDENT") || role.toUpperCase().contains("ELEV")) {
            return ResponseEntity.ok(elevhalsaService.getBookingsForStudent(userId));
        } else {
            return ResponseEntity.ok(elevhalsaService.getBookingsForStaff(userId));
        }
    }
}
