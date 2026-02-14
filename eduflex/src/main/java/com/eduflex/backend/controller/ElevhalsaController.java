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
    private com.eduflex.backend.repository.UserRepository userRepository;

    @Autowired
    private ElevhalsaService elevhalsaService;

    private com.eduflex.backend.model.User getCurrentUser() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));
    }

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
            @RequestBody com.eduflex.backend.dto.JournalEntryRequestDTO request) {

        return ResponseEntity.ok(elevhalsaService.addJournalEntry(
                id,
                getCurrentUser(),
                request.getContent(),
                request.getVisibility()));
    }

    @GetMapping("/cases/{id}/journal")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'HALSOTEAM', 'ROLE_HALSOTEAM', 'STUDENT', 'ROLE_STUDENT', 'GUARDIAN', 'ROLE_GUARDIAN')")
    public ResponseEntity<List<com.eduflex.backend.model.ElevhalsaJournalEntry>> getCaseJournal(
            @PathVariable Long id) {

        return ResponseEntity.ok(elevhalsaService.getCaseJournal(id, getCurrentUser()));
    }

    // --- Booking System ---

    @PostMapping("/bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.eduflex.backend.model.ElevhalsaBooking> createBooking(
            @RequestBody com.eduflex.backend.dto.BookingRequestDTO request) {

        return ResponseEntity.ok(elevhalsaService.createBooking(
                request.getStudentId(),
                request.getStaffId(),
                request.getStartTime(),
                request.getEndTime(),
                request.getType(),
                request.getNotes()));
    }

    @GetMapping("/bookings/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<com.eduflex.backend.model.ElevhalsaBooking>> getMyBookings() {
        com.eduflex.backend.model.User user = getCurrentUser();

        if (user.getRole().getName().contains("STUDENT") || user.getRole().getName().contains("ELEV")) {
            return ResponseEntity.ok(elevhalsaService.getBookingsForStudent(user.getId()));
        } else {
            return ResponseEntity.ok(elevhalsaService.getBookingsForStaff(user.getId()));
        }
    }
}
