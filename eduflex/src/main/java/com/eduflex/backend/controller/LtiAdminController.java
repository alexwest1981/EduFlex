package com.eduflex.backend.controller;

import com.eduflex.backend.model.LtiPlatform;
import com.eduflex.backend.repository.LtiPlatformRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lti/platforms")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Tag(name = "LTI Platform Management", description = "Admin endpoints to manage LTI Integrations")
public class LtiAdminController {

    private final LtiPlatformRepository platformRepository;

    @Autowired
    public LtiAdminController(LtiPlatformRepository platformRepository) {
        this.platformRepository = platformRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List LTI Platforms", description = "Get all configured LTI platforms (integrations).")
    public List<LtiPlatform> getAllPlatforms() {
        return platformRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create/Update LTI Platform", description = "Add a new LMS integration or update existing.")
    public LtiPlatform savePlatform(@RequestBody LtiPlatform platform) {
        return platformRepository.save(platform);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete LTI Platform", description = "Remove an LMS integration.")
    public ResponseEntity<?> deletePlatform(@PathVariable Long id) {
        platformRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
