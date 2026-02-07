package com.eduflex.backend.controller;

import com.eduflex.backend.model.Cmi5Package;
import com.eduflex.backend.service.Cmi5Service;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/cmi5")
public class Cmi5Controller {

    private static final Logger logger = LoggerFactory.getLogger(Cmi5Controller.class);

    private final Cmi5Service cmi5Service;

    public Cmi5Controller(Cmi5Service cmi5Service) {
        this.cmi5Service = cmi5Service;
    }

    @PostMapping("/upload/{courseId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<List<Map<String, Object>>> uploadPackages(
            @PathVariable Long courseId,
            @RequestParam("files") MultipartFile[] files) {
        List<Map<String, Object>> results = new ArrayList<>();
        for (MultipartFile file : files) {
            try {
                results.add(cmi5Service.importPackage(courseId, file));
            } catch (IOException e) {
                logger.error("Failed to import {}: {}", file.getOriginalFilename(), e.getMessage());
            }
        }
        return ResponseEntity.ok(results);
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Cmi5Package>> getPackagesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(cmi5Service.getByCourseId(courseId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Cmi5Package> getPackage(@PathVariable Long id) {
        return ResponseEntity.ok(cmi5Service.getPackage(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<Cmi5Package> updatePackage(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(cmi5Service.updatePackage(id, body.get("title")));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        cmi5Service.deletePackage(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/auth-token")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> getLrsAuthToken() {
        // Generate a short-lived token specifically for xAPI LRS interaction
        String token = cmi5Service.generateLrsToken();
        return ResponseEntity.ok(token);
    }

    @PostMapping("/init-launch")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> initLaunch(@RequestBody Map<String, String> payload) {
        String packageId = payload.get("packageId");
        String registration = payload.get("registration");
        String actor = payload.get("actor");

        // Extract email from simple actor string or object if needed (frontend sends
        // email/username usually)
        // Here assuming frontend sends the identifier used in LRS (username or email).
        cmi5Service.initializeLaunchState(packageId, registration, actor);
        return ResponseEntity.ok().build();
    }
}
