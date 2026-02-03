package com.eduflex.backend.controller;

import com.eduflex.backend.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminStatsController {

    private final DocumentService documentService;

    public AdminStatsController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/storage-stats")
    public ResponseEntity<?> getAdminStats() {
        try {
            return ResponseEntity.ok(documentService.getSystemStorageUsage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
