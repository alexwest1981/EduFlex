package com.eduflex.backend.controller;

import com.eduflex.backend.service.LtiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/lti/nrps")
public class LtiNrpsController {

    private final LtiService ltiService;
    private final com.eduflex.backend.repository.LtiLaunchRepository ltiLaunchRepository;

    public LtiNrpsController(LtiService ltiService,
            com.eduflex.backend.repository.LtiLaunchRepository ltiLaunchRepository) {
        this.ltiService = ltiService;
        this.ltiLaunchRepository = ltiLaunchRepository;
    }

    /**
     * Trigger membership sync for a specific platform and context.
     * 
     * Expects: { "issuer": "...", "membershipsUrl": "..." }
     */
    @PostMapping("/sync/{courseId}")
    public ResponseEntity<Map<String, String>> syncMembers(@PathVariable Long courseId) {
        // Find a valid LTI Launch with NRPS capabilities for this course
        com.eduflex.backend.repository.LtiLaunchRepository ltiLaunchRepository = org.springframework.web.context.ContextLoader
                .getCurrentWebApplicationContext()
                .getBean(com.eduflex.backend.repository.LtiLaunchRepository.class);

        // We search for ".../courses/{courseId}"
        // NOTE: This assumes the LTI launch Target Link URI follows our standard
        // pattern
        String uriFragment = "/courses/" + courseId;
        com.eduflex.backend.model.LtiLaunch launch = ltiLaunchRepository
                .findFirstByTargetLinkUriContainingAndNrpsMembershipUrlIsNotNull(uriFragment)
                .orElse(null);

        if (launch == null) {
            return ResponseEntity.badRequest().body(Map.of("message",
                    "No valid LTI NRPS context found for this course. Has anyone launched it via LTI yet?"));
        }

        try {
            ltiService.syncMembers(launch.getPlatformIssuer(), launch.getNrpsMembershipUrl(), courseId);
            return ResponseEntity.ok(Map.of("message", "Synchronization started successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Sync failed: " + e.getMessage()));
        }
    }
}
