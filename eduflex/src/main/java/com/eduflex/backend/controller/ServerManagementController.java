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
import org.springframework.transaction.annotation.Transactional;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.model.User;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.File;
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

    @Autowired
    private UserRepository userRepository;

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

    @PostMapping("/backups/restore/{*backupId}")
    public ResponseEntity<Map<String, String>> restoreBackup(@PathVariable String backupId) {
        String cleanId = backupId.startsWith("/") ? backupId.substring(1) : backupId;
        backupService.restoreBackup(cleanId);
        return ResponseEntity.ok(Map.of("message", "Backup restored successfully"));
    }

    @DeleteMapping("/backups/{*backupId}")
    public ResponseEntity<Map<String, String>> deleteBackup(@PathVariable String backupId) {
        String cleanId = backupId.startsWith("/") ? backupId.substring(1) : backupId;
        backupService.deleteBackup(cleanId);
        return ResponseEntity.ok(Map.of("message", "Backup deleted successfully"));
    }

    @GetMapping("/backups/download/{*backupId}")
    public ResponseEntity<Resource> downloadBackup(@PathVariable String backupId) {
        String cleanId = backupId.startsWith("/") ? backupId.substring(1) : backupId;
        File file = backupService.getBackupFile(cleanId);
        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                .body(resource);
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

    // ==================== SECURITY & COMPLIANCE (ISO 27001) ====================

    @PostMapping("/security/migrate-pii")
    @Transactional
    public ResponseEntity<Map<String, String>> migratePii() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            // Trigger JPA AttributeConverter by re-saving existing data
            userRepository.save(user);
        }
        return ResponseEntity.ok(Map.of(
                "message", "PII Encryption Migration Successful",
                "usersProcessed", String.valueOf(users.size())));
    }
}
