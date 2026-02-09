package com.eduflex.backend.controller;

import com.eduflex.backend.model.AcademicTerm;
import com.eduflex.backend.model.SchoolPolicy;
import com.eduflex.backend.model.User;
import com.eduflex.backend.service.AcademicGovernanceService;
import com.eduflex.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/governance")
public class AcademicGovernanceController {

    private final AcademicGovernanceService academicGovernanceService;
    private final UserService userService;

    public AcademicGovernanceController(AcademicGovernanceService academicGovernanceService, UserService userService) {
        this.academicGovernanceService = academicGovernanceService;
        this.userService = userService;
    }

    // --- Terms ---
    @GetMapping("/terms")
    public ResponseEntity<List<AcademicTerm>> getAllTerms() {
        return ResponseEntity.ok(academicGovernanceService.getAllTerms());
    }

    @PostMapping("/terms")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<AcademicTerm> createTerm(@RequestBody AcademicTerm term) {
        return ResponseEntity.ok(academicGovernanceService.saveTerm(term));
    }

    @PatchMapping("/terms/{id}/lock")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<Void> lockTerm(@PathVariable Long id, @RequestParam boolean locked) {
        academicGovernanceService.lockTerm(id, locked);
        return ResponseEntity.ok().build();
    }

    // --- Policies ---
    @GetMapping("/policies")
    public ResponseEntity<List<SchoolPolicy>> getAllPolicies() {
        return ResponseEntity.ok(academicGovernanceService.getAllPolicies());
    }

    @PostMapping("/policies")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<SchoolPolicy> createPolicy(@RequestBody SchoolPolicy policy) {
        return ResponseEntity.ok(academicGovernanceService.savePolicy(policy));
    }

    @PostMapping("/policies/{id}/accept")
    public ResponseEntity<Void> acceptPolicy(@PathVariable Long id, @AuthenticationPrincipal String username) {
        User user = userService.getUserByUsername(username);
        academicGovernanceService.acceptPolicy(id, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/policies/{id}/check")
    public ResponseEntity<Boolean> checkPolicy(@PathVariable Long id, @AuthenticationPrincipal String username) {
        User user = userService.getUserByUsername(username);
        return ResponseEntity.ok(academicGovernanceService.hasUserAcceptedPolicy(id, user.getId()));
    }
}
