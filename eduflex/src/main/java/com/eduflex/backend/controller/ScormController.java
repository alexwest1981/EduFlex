package com.eduflex.backend.controller;

import com.eduflex.backend.model.ScormPackage;
import com.eduflex.backend.service.ScormService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/scorm")
public class ScormController {

    private static final Logger logger = LoggerFactory.getLogger(ScormController.class);
    private final ScormService scormService;

    public ScormController(ScormService scormService) {
        this.scormService = scormService;
    }

    @PostMapping("/upload/{courseId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<List<ScormPackage>> uploadScorm(
            @PathVariable Long courseId,
            @RequestParam("files") MultipartFile[] files) {
        logger.info("Received request to upload {} SCORM package(s) for course {}", files.length, courseId);
        try {
            List<ScormPackage> savedPackages = scormService.uploadPackages(courseId, files);
            logger.info("Successfully uploaded {} SCORM packages", savedPackages.size());
            return ResponseEntity.ok(savedPackages);
        } catch (Exception e) {
            logger.error("Failed to upload SCORM package for course {}", courseId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ScormPackage>> getPackages(@PathVariable Long courseId) {
        logger.debug("Fetching SCORM packages for course {}", courseId);
        try {
            return ResponseEntity.ok(scormService.getPackagesByCourse(courseId));
        } catch (Exception e) {
            logger.error("Error fetching SCORM packages for course {}", courseId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ScormPackage> getPackage(@PathVariable Long id) {
        logger.debug("Fetching SCORM package details for ID {}", id);
        try {
            ScormPackage pkg = scormService.getPackage(id);
            if (pkg == null) {
                logger.warn("SCORM package with ID {} not found", id);
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(pkg);
        } catch (Exception e) {
            logger.error("Error fetching SCORM package {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<ScormPackage> updatePackage(@PathVariable Long id, @RequestBody ScormPackage updates) {
        logger.info("Updating SCORM package {}", id);
        try {
            ScormPackage updated = scormService.updatePackage(id, updates);
            if (updated == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("Failed to update SCORM package {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        logger.info("Deleting SCORM package {}", id);
        try {
            scormService.deletePackage(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Failed to delete SCORM package {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
