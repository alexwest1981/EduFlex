package com.eduflex.backend.controller;

import com.eduflex.backend.service.PrincipalImpersonationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/principal/impersonate")
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
public class PrincipalImpersonationController {

    private final PrincipalImpersonationService impersonationService;

    public PrincipalImpersonationController(PrincipalImpersonationService impersonationService) {
        this.impersonationService = impersonationService;
    }

    @PostMapping("/start/{userId}")
    public ResponseEntity<Void> startImpersonation(@PathVariable Long userId, @AuthenticationPrincipal String principalUsername) {
        impersonationService.startImpersonation(principalUsername, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/stop")
    public ResponseEntity<Void> stopImpersonation(@AuthenticationPrincipal String principalUsername) {
        impersonationService.stopImpersonation(principalUsername);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status")
    public ResponseEntity<Long> getStatus(@AuthenticationPrincipal String principalUsername) {
        return ResponseEntity.ok(impersonationService.getImpersonatedUserId(principalUsername));
    }
}
