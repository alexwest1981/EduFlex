package com.eduflex.scorm.controller;

import com.eduflex.scorm.model.Cmi5Package;
import com.eduflex.scorm.service.Cmi5Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/cmi5")
public class Cmi5Controller {

    private static final Logger log = LoggerFactory.getLogger(Cmi5Controller.class);
    private final Cmi5Service cmi5Service;

    public Cmi5Controller(Cmi5Service cmi5Service) {
        this.cmi5Service = cmi5Service;
    }

    @PostMapping("/import/{courseId}")
    public ResponseEntity<Map<String, Object>> importPackage(
            @PathVariable Long courseId,
            @RequestParam("file") MultipartFile file) throws IOException {
        log.info("Importing Cmi5 package for course: {}", courseId);
        return ResponseEntity.ok(cmi5Service.importPackage(courseId, file));
    }

    @PostMapping("/launch-state")
    public ResponseEntity<Void> initializeLaunchState(
            @RequestParam String packageId,
            @RequestParam String registration,
            @RequestParam String actorEmail) {
        log.info("Initializing Cmi5 launch state for package: {}", packageId);
        cmi5Service.initializeLaunchState(packageId, registration, actorEmail);
        return ResponseEntity.ok().build();
    }
}
