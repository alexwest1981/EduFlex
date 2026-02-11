package com.eduflex.backend.controller;

import com.eduflex.backend.model.SickLeaveReport;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.SickLeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sick-leave")
public class SickLeaveController {

    @Autowired
    private SickLeaveService sickLeaveService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/report")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SickLeaveReport> report(@RequestBody Map<String, String> body) {
        User user = getAuthenticatedUser();
        LocalDate startDate = LocalDate.parse(body.getOrDefault("startDate", LocalDate.now().toString()));
        LocalDate endDate = body.containsKey("endDate") && body.get("endDate") != null
                && !body.get("endDate").isEmpty()
                        ? LocalDate.parse(body.get("endDate"))
                        : null;
        String reason = body.getOrDefault("reason", null);

        return ResponseEntity
                .ok(sickLeaveService.reportSickLeave(user.getId(), startDate, endDate, reason, user.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SickLeaveReport> cancel(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(sickLeaveService.cancelSickLeave(id, user.getId()));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SickLeaveReport>> getMyHistory() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(sickLeaveService.getMySickLeaveHistory(user.getId()));
    }

    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SickLeaveReport> getActive() {
        User user = getAuthenticatedUser();
        SickLeaveReport active = sickLeaveService.getActiveSickLeave(user.getId());
        return ResponseEntity.ok(active);
    }

    @GetMapping("/today")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'HALSOTEAM', 'ROLE_HALSOTEAM', 'MENTOR', 'ROLE_MENTOR')")
    public ResponseEntity<List<SickLeaveReport>> getToday() {
        return ResponseEntity.ok(sickLeaveService.getTodaySickLeaves());
    }
}
