package com.eduflex.backend.controller;

import com.eduflex.backend.model.User;
import com.eduflex.backend.service.GuardianDashboardService;
import com.eduflex.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/guardian")
public class GuardianDashboardController {

    private final GuardianDashboardService guardianDashboardService;
    private final UserService userService;

    public GuardianDashboardController(GuardianDashboardService guardianDashboardService, UserService userService) {
        this.guardianDashboardService = guardianDashboardService;
        this.userService = userService;
    }

    @GetMapping("/children")
    @PreAuthorize("hasRole('GUARDIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<User>> getChildren(Principal principal) {
        User guardian = userService.getUserByUsername(principal.getName());
        return ResponseEntity.ok(guardianDashboardService.getChildren(guardian));
    }

    @GetMapping("/dashboard/{studentId}")
    @PreAuthorize("hasRole('GUARDIAN') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getChildDashboard(
            @PathVariable Long studentId,
            Principal principal) {

        User currentUser = userService.getUserByUsername(principal.getName());
        boolean isAdmin = currentUser.getRole().getName().equalsIgnoreCase("ADMIN");

        if (isAdmin) {
            User child = userService.getUserById(studentId);
            return ResponseEntity.ok(guardianDashboardService.getChildDashboardMetrics(child));
        }

        List<User> children = guardianDashboardService.getChildren(currentUser);
        Optional<User> childOpt = children.stream()
                .filter(c -> c.getId().equals(studentId))
                .findFirst();

        if (childOpt.isEmpty()) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(guardianDashboardService.getChildDashboardMetrics(childOpt.get()));
    }
}
