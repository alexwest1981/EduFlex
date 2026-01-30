package com.eduflex.backend.controller;

import com.eduflex.backend.model.AuditLog;
import com.eduflex.backend.repository.AuditLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/audit")
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    public AuditController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAllLogs(
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entity) {

        List<AuditLog> logs = auditLogRepository.findAllByOrderByTimestampDesc();

        if (user != null && !user.isEmpty()) {
            logs = logs.stream()
                    .filter(l -> l.getModifiedBy().toLowerCase().contains(user.toLowerCase()))
                    .collect(Collectors.toList());
        }

        if (action != null && !action.isEmpty()) {
            logs = logs.stream()
                    .filter(l -> l.getAction().equalsIgnoreCase(action))
                    .collect(Collectors.toList());
        }

        if (entity != null && !entity.isEmpty()) {
            logs = logs.stream()
                    .filter(l -> l.getEntityName().equalsIgnoreCase(entity))
                    .collect(Collectors.toList());
        }

        // Limit to 500 latest for performance
        List<AuditLog> limitedLogs = logs.stream().limit(500).collect(Collectors.toList());

        return ResponseEntity.ok(limitedLogs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditLog> getLogById(@PathVariable Long id) {
        return auditLogRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
