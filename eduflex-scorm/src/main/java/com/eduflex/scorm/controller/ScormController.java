package com.eduflex.scorm.controller;

import com.eduflex.scorm.model.ScormPackage;
import com.eduflex.scorm.service.ScormService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/scorm")
public class ScormController {

    private static final Logger log = LoggerFactory.getLogger(ScormController.class);
    private final ScormService scormService;

    public ScormController(ScormService scormService) {
        this.scormService = scormService;
    }

    @PostMapping("/upload/{courseId}")
    public ResponseEntity<List<ScormPackage>> uploadPackages(
            @PathVariable Long courseId,
            @RequestParam("files") MultipartFile[] files) throws Exception {
        log.info("Receiving SCORM upload request for course: {}", courseId);
        return ResponseEntity.ok(scormService.uploadPackages(courseId, files));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ScormPackage>> getPackagesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(scormService.getPackagesByCourse(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScormPackage> getPackage(@PathVariable Long id) {
        ScormPackage pkg = scormService.getPackage(id);
        return pkg != null ? ResponseEntity.ok(pkg) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        scormService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}
