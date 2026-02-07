package com.eduflex.backend.controller;

import com.eduflex.backend.service.LtiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/lti/nrps")
public class LtiNrpsController {

    private final LtiService ltiService;

    public LtiNrpsController(LtiService ltiService) {
        this.ltiService = ltiService;
    }

    /**
     * Trigger membership sync for a specific platform and context.
     * 
     * Expects: { "issuer": "...", "membershipsUrl": "..." }
     */
    @PostMapping("/sync")
    public ResponseEntity<Map<String, String>> syncMembers(@RequestBody Map<String, String> request) {
        String issuer = request.get("issuer");
        String membershipsUrl = request.get("membershipsUrl");

        if (issuer == null || membershipsUrl == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing issuer or membershipsUrl"));
        }

        try {
            ltiService.syncMembers(issuer, membershipsUrl);
            return ResponseEntity.ok(Map.of("message", "Synchronization started successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Sync failed: " + e.getMessage()));
        }
    }
}
