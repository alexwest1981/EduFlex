package com.eduflex.backend.controller;

import com.eduflex.backend.model.AiAuditRecord;
import com.eduflex.backend.service.AiAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<Page<AiAuditRecord>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(aiAuditService.getAllAuditLogs(
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<List<AiAuditRecord>> getAuditLogsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(aiAuditService.getAuditLogsByUser(userId));
    }
}
