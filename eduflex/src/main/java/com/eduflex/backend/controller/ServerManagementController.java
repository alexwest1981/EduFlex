package com.eduflex.backend.controller;

import com.eduflex.backend.dto.BackupResponse;

import com.eduflex.backend.dto.AddDatabaseRequest;
import com.eduflex.backend.dto.SwitchDatabaseRequest;
import com.eduflex.backend.service.BackupService;
import com.eduflex.backend.service.DatabaseManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
public class ServerManagementController {

    @Autowired
    private BackupService backupService;

    @Autowired
    private DatabaseManagementService databaseManagementService;

    // ==================== BACKUP ENDPOINTS ====================

    @GetMapping("/backups")
    public ResponseEntity<List<BackupResponse>> listBackups() {
        return ResponseEntity.ok(backupService.listBackups());
    }

    @GetMapping("/backups/status")
    public ResponseEntity<Map<String, Object>> getBackupStatus() {
        return ResponseEntity.ok(backupService.getBackupStatus());
    }

    @PostMapping("/backups/create")
    public ResponseEntity<BackupResponse> createBackup() {
        return ResponseEntity.ok(backupService.createBackup());
    }

    @PostMapping("/backups/restore/{backupId}")
    public ResponseEntity<Map<String, String>> restoreBackup(@PathVariable String backupId) {
        backupService.restoreBackup(backupId);
        return ResponseEntity.ok(Map.of("message", "Backup restored successfully"));
    }

    @DeleteMapping("/backups/{backupId}")
    public ResponseEntity<Map<String, String>> deleteBackup(@PathVariable String backupId) {
        backupService.deleteBackup(backupId);
        return ResponseEntity.ok(Map.of("message", "Backup deleted successfully"));
    }

    // ==================== DATABASE MANAGEMENT ENDPOINTS ====================

    @GetMapping("/database/connections")
    public ResponseEntity<Map<String, Object>> getDatabaseConnections() {
        return ResponseEntity.ok(databaseManagementService.getConnections());
    }

    @PostMapping("/database/switch/{connectionId}")
    public ResponseEntity<Map<String, String>> switchDatabase(
            @PathVariable String connectionId,
            @RequestBody SwitchDatabaseRequest request) {
        databaseManagementService.switchDatabase(connectionId, request.getAdminPassword());
        return ResponseEntity.ok(Map.of("message", "Database switched successfully"));
    }

    @PostMapping("/database/add")
    public ResponseEntity<Map<String, String>> addDatabase(@RequestBody AddDatabaseRequest request) {
        databaseManagementService.addDatabase(request);
        return ResponseEntity.ok(Map.of("message", "Database added successfully"));
    }
}
