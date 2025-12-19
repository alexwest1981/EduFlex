package com.eduflex.backend.controller;

import com.eduflex.backend.dto.AssignmentDTO;
import com.eduflex.backend.dto.SubmissionDTO;
import com.eduflex.backend.model.Assignment;
import com.eduflex.backend.model.Submission;
import com.eduflex.backend.service.AssignmentService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    // --- ASSIGNMENTS ---

    @PostMapping("/courses/{courseId}/assignments")
    public ResponseEntity<Assignment> createAssignment(
            @PathVariable Long courseId,
            @RequestBody AssignmentDTO dto) {
        // Notera: DTO:n skickar datum som sträng i JSON, men Jackson konverterar till LocalDateTime om formatet är rätt
        return ResponseEntity.ok(assignmentService.createAssignment(courseId, dto.title(), dto.description(), dto.dueDate()));
    }

    @GetMapping("/courses/{courseId}/assignments")
    public List<AssignmentDTO> getAssignments(@PathVariable Long courseId) {
        return assignmentService.getAssignmentsForCourse(courseId);
    }

    // --- SUBMISSIONS ---

    @PostMapping(value = "/assignments/{assignmentId}/submit/{studentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Submission> submitAssignment(
            @PathVariable Long assignmentId,
            @PathVariable Long studentId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(assignmentService.submitAssignment(assignmentId, studentId, file));
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public List<SubmissionDTO> getSubmissions(@PathVariable Long assignmentId) {
        return assignmentService.getSubmissionsForAssignment(assignmentId);
    }

    @PostMapping("/submissions/{id}/grade")
    public ResponseEntity<Submission> gradeSubmission(
            @PathVariable Long id,
            @RequestParam String grade,
            @RequestParam(required = false) String feedback) {
        return ResponseEntity.ok(assignmentService.gradeSubmission(id, grade, feedback));
    }
}