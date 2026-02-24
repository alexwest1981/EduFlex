package com.eduflex.backend.controller;

import com.eduflex.backend.service.SisImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Controller för SIS-import (Student Information System).
 * Admin kan ladda upp CSV-filer för att bulk-importera elever.
 */
@RestController
@RequestMapping("/api/integrations/sis")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Tag(name = "SIS Import", description = "CSV-import av elever och klasser")
@RequiredArgsConstructor
public class SisImportController {

    private final SisImportService sisImportService;

    @PostMapping("/import/students")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Importera elever från CSV", description = "Format: förnamn,efternamn,email,personnummer")
    public ResponseEntity<Map<String, Object>> importStudents(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", "Ingen fil vald"));
        }

        Map<String, Object> result = sisImportService.importStudentsFromCsv(file);
        return ResponseEntity.ok(result);
    }
}
