package com.eduflex.backend.controller;

import com.eduflex.backend.model.GuardianChildLink;
import com.eduflex.backend.model.User;
import com.eduflex.backend.service.GuardianDashboardService;
import com.eduflex.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin/guardians")
@PreAuthorize("hasRole('ADMIN')")
public class GuardianManagementController {

    private final GuardianDashboardService guardianDashboardService;
    private final UserService userService;

    public GuardianManagementController(GuardianDashboardService guardianDashboardService, UserService userService) {
        this.guardianDashboardService = guardianDashboardService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllGuardians() {
        return ResponseEntity.ok(guardianDashboardService.getAllGuardians());
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<Map<String, Object>> getGuardianDetails(@PathVariable Long id) {
        User guardian = userService.getUserById(id);
        List<GuardianChildLink> links = guardianDashboardService.getGuardianLinks(guardian);

        Map<String, Object> response = new HashMap<>();
        response.put("guardian", guardian);
        response.put("links", links);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/link/{studentId}")
    public ResponseEntity<Void> linkChild(@PathVariable Long id, @PathVariable Long studentId) {
        guardianDashboardService.linkChild(id, studentId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/links/{linkId}")
    public ResponseEntity<Void> unlinkChild(@PathVariable Long linkId) {
        guardianDashboardService.unlinkChild(linkId);
        return ResponseEntity.ok().build();
    }
}
