package com.eduflex.backend.controller;

import com.eduflex.backend.model.User;
import com.eduflex.backend.model.survey.SurveyDistribution;
import com.eduflex.backend.model.survey.SurveyResponse;
import com.eduflex.backend.model.survey.SurveyTemplate;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.SurveyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/elevhalsa/surveys")
public class SurveyController {

    @Autowired
    private SurveyService surveyService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // --- Template Endpoints ---

    @GetMapping("/templates")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<List<SurveyTemplate>> getTemplates() {
        return ResponseEntity.ok(surveyService.getActiveTemplates());
    }

    @PostMapping("/templates")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<SurveyTemplate> createTemplate(@RequestBody SurveyTemplate template) {
        return ResponseEntity.ok(surveyService.createTemplate(template, getAuthenticatedUser()));
    }

    @PutMapping("/templates/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<SurveyTemplate> updateTemplate(@PathVariable Long id,
            @RequestBody SurveyTemplate template) {
        return ResponseEntity.ok(surveyService.updateTemplate(id, template));
    }

    @DeleteMapping("/templates/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        surveyService.deleteTemplate(id);
        return ResponseEntity.ok().build();
    }

    // --- Distribution Endpoints ---

    @PostMapping("/distribute")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<SurveyDistribution> distribute(@RequestBody Map<String, Object> req) {
        Long templateId = Long.parseLong(req.get("templateId").toString());
        String targetRole = req.get("targetRole").toString();
        LocalDateTime deadline = req.containsKey("deadline") && req.get("deadline") != null
                ? LocalDateTime.parse(req.get("deadline").toString())
                : null;

        return ResponseEntity
                .ok(surveyService.createDistribution(templateId, targetRole, deadline, getAuthenticatedUser()));
    }

    @GetMapping("/distributions")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<List<SurveyDistribution>> getDistributions() {
        return ResponseEntity.ok(surveyService.getAllDistributions());
    }

    @PostMapping("/distributions/{id}/close")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<SurveyDistribution> closeDistribution(@PathVariable Long id) {
        return ResponseEntity.ok(surveyService.closeDistribution(id));
    }

    // --- Respondent Endpoints ---

    @GetMapping("/my-pending")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getMyPendingSurveys() {
        return ResponseEntity.ok(surveyService.getPendingSurveysForUser(getAuthenticatedUser()));
    }

    @GetMapping("/distributions/{id}/details")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getDistributionDetails(@PathVariable Long id) {
        return ResponseEntity.ok(surveyService.getDistributionDetails(id));
    }

    @SuppressWarnings("unchecked")
    @PostMapping("/distributions/{id}/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SurveyResponse> submitResponse(@PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Map<String, Object> answers = (Map<String, Object>) body.get("answers");
        return ResponseEntity.ok(surveyService.submitResponse(id, getAuthenticatedUser(), answers));
    }

    // --- Results ---

    @GetMapping("/distributions/{id}/results")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<Map<String, Object>> getResults(@PathVariable Long id) {
        return ResponseEntity.ok(surveyService.getDistributionResults(id));
    }

    // --- Available roles ---

    @GetMapping("/roles")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<List<Map<String, String>>> getAvailableRoles() {
        return ResponseEntity.ok(surveyService.getAvailableRoles());
    }
}
