package com.eduflex.backend.controller;

import com.eduflex.backend.model.User;
import com.eduflex.backend.model.evaluation.*;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.EvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluations")
public class EvaluationController {

    @Autowired
    private EvaluationService evaluationService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username).orElse(null));
    }

    // --- Template Endpoints ---

    @GetMapping("/templates")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EvaluationTemplate>> getTemplates() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(evaluationService.getTemplates(user != null ? user.getId() : null));
    }

    @PostMapping("/templates")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<EvaluationTemplate> createTemplate(@RequestBody EvaluationTemplate template) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(evaluationService.createTemplate(template, user));
    }

    // --- Instance Endpoints ---

    @PostMapping("/activate")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<EvaluationInstance> activate(@RequestBody Map<String, Object> request) {
        Long courseId = Long.valueOf(request.get("courseId").toString());
        Long templateId = Long.valueOf(request.get("templateId").toString());
        String title = request.getOrDefault("title", "").toString();

        return ResponseEntity.ok(evaluationService.activateEvaluation(courseId, templateId, title));
    }

    @GetMapping("/course/{courseId}/instances")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EvaluationInstance>> getCourseEvaluations(@PathVariable Long courseId) {
        return ResponseEntity.ok(evaluationService.getInstancesForCourse(courseId));
    }

    @GetMapping("/my-active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EvaluationInstance>> getMyActiveEvaluations() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(evaluationService.getActiveEvaluationsForStudent(user));
    }

    // --- Response Endpoints ---

    @PostMapping("/instance/{instanceId}/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> submitResponse(
            @PathVariable Long instanceId,
            @RequestBody Map<Long, String> answers) {
        User user = getAuthenticatedUser();
        try {
            evaluationService.submitResponse(instanceId, user != null ? user.getId() : null, answers);
            return ResponseEntity.ok(Map.of("message", "Tack för ditt svar!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Analytics Endpoints ---

    @GetMapping("/instance/{instanceId}/summary")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<Map<String, Object>> getSummary(@PathVariable Long instanceId) {
        return ResponseEntity.ok(evaluationService.getEvaluationSummary(instanceId));
    }

    @PostMapping("/instance/{instanceId}/analyze")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<Map<String, String>> analyze(@PathVariable Long instanceId) {
        String summary = evaluationService.generateAISummary(instanceId);
        return ResponseEntity.ok(Map.of("summary", summary));
    }
}
