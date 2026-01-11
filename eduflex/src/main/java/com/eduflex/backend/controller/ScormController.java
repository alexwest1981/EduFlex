package com.eduflex.backend.controller;

import com.eduflex.backend.model.ScormPackage;
import com.eduflex.backend.service.ScormService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/scorm")
public class ScormController {

    private final ScormService scormService;

    public ScormController(ScormService scormService) {
        this.scormService = scormService;
    }

    @PostMapping("/upload/{courseId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ScormPackage> uploadScorm(
            @PathVariable Long courseId,
            @RequestParam("file") MultipartFile file) {
        try {
            ScormPackage savedPackage = scormService.uploadPackage(courseId, file);
            return ResponseEntity.ok(savedPackage);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ScormPackage>> getPackages(@PathVariable Long courseId) {
        return ResponseEntity.ok(scormService.getPackagesForCourse(courseId));
    }

    // Future: Endpoint to save progress (CMI data)
    @PostMapping("/{packageId}/track")
    public ResponseEntity<?> saveProgress(@PathVariable Long packageId, @RequestBody Object cmiData) {
        // TODO: Save to ScormProgress table
        return ResponseEntity.ok().build();
    }
}
