package com.eduflex.backend.controller;

import com.eduflex.backend.model.AiAuditLog;
import com.eduflex.backend.service.AiAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/ai-audit")
@RequiredArgsConstructor
public class AiAuditController {

    private final AiAuditService aiAuditService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<AiAuditLog>> getAllAuditLogs() {
        return ResponseEntity.ok(aiAuditService.getAllLogs());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<AiAuditLog>> getAuditLogsByUser(@PathVariable Long userId) {
        // Since we log by username (actorId), we need to fetch user first or assume
        // actorId is username
        // Here we assume the frontend sends the USERNAME as the path variable or we
        // change the endpoint to accept string
        // For now, let's assume we change the repository to find by ActorId (which is
        // String)
        return ResponseEntity.ok(aiAuditService.getLogsByActor(String.valueOf(userId)));
    }
}
