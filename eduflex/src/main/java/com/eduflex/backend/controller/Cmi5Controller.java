package com.eduflex.backend.controller;

import com.eduflex.backend.service.Cmi5Service;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/cmi5")
public class Cmi5Controller {

    private final Cmi5Service cmi5Service;

    public Cmi5Controller(Cmi5Service cmi5Service) {
        this.cmi5Service = cmi5Service;
    }

    @PostMapping("/upload/{courseId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadPackage(
            @PathVariable Long courseId,
            @RequestParam("file") MultipartFile file) {
        try {
            // Returns metadata about the imported AU (Assignable Unit)
            Map<String, Object> auData = cmi5Service.importPackage(courseId, file);
            return ResponseEntity.ok(auData);
        } catch (IOException e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to process cmi5 package: " + e.getMessage()));
        }
    }

    @PostMapping("/auth-token")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> getLrsAuthToken() {
        // Generate a short-lived token specifically for xAPI LRS interaction
        String token = cmi5Service.generateLrsToken();
        return ResponseEntity.ok(token);
    }
}
