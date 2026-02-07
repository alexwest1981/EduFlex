package com.eduflex.backend.controller;

import com.eduflex.backend.model.ScormPackage;
import com.eduflex.backend.service.ScormService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/scorm")
public class ScormController {

    private final ScormService scormService;

    public ScormController(ScormService scormService) {
        this.scormService = scormService;
    }

    @PostMapping("/upload/{courseId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<List<ScormPackage>> uploadScorm(
            @PathVariable Long courseId,
            @RequestParam("files") MultipartFile[] files) {
        try {
            List<ScormPackage> savedPackages = scormService.uploadPackages(courseId, files);
            return ResponseEntity.ok(savedPackages);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ScormPackage>> getPackages(@PathVariable Long courseId) {
        return ResponseEntity.ok(scormService.getPackagesByCourse(courseId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ScormPackage> getPackage(@PathVariable Long id) {
        return ResponseEntity.ok(scormService.getPackage(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<ScormPackage> updatePackage(@PathVariable Long id, @RequestBody ScormPackage updates) {
        return ResponseEntity.ok(scormService.updatePackage(id, updates));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        scormService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}
