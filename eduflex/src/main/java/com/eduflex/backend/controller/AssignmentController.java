package com.eduflex.backend.controller;

import com.eduflex.backend.dto.AssignmentDTO;
import com.eduflex.backend.dto.SubmissionDTO;
import com.eduflex.backend.model.Assignment;
import com.eduflex.backend.model.Notification;
import com.eduflex.backend.model.Submission;
import com.eduflex.backend.repository.NotificationRepository;
import com.eduflex.backend.service.AssignmentService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AssignmentController {

    private final AssignmentService assignmentService;
    // NYTT: Behövs för att skapa notiser
    private final NotificationRepository notificationRepository;

    public AssignmentController(AssignmentService assignmentService, NotificationRepository notificationRepository) {
        this.assignmentService = assignmentService;
        this.notificationRepository = notificationRepository;
    }

    // --- ASSIGNMENTS ---

    @PostMapping("/courses/{courseId}/assignments")
    public ResponseEntity<Assignment> createAssignment(
            @PathVariable Long courseId,
            @RequestBody AssignmentDTO dto) {
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

        Submission submission = assignmentService.submitAssignment(assignmentId, studentId, file);

        // --- NOTIFIERING (Till Läraren) ---
        try {
            Assignment assignment = submission.getAssignment();
            // Vi antar att Assignment -> Course -> Teacher relationen finns och är laddad
            Long teacherId = assignment.getCourse().getTeacher().getId();

            Notification n = new Notification();
            n.setUserId(teacherId);
            n.setMessage("Ny inlämning: " + submission.getStudent().getFullName() + " i " + assignment.getTitle());
            n.setType("INFO");
            notificationRepository.save(n);
        } catch (Exception e) {
            System.err.println("Kunde inte skapa inlämningsnotis: " + e.getMessage());
        }
        // ----------------------------------

        return ResponseEntity.ok(submission);
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

        Submission submission = assignmentService.gradeSubmission(id, grade, feedback);

        // --- NOTIFIERING (Till Eleven) ---
        try {
            Notification n = new Notification();
            n.setUserId(submission.getStudent().getId());
            n.setMessage("Betyg satt: " + grade + " på uppgiften " + submission.getAssignment().getTitle());
            n.setType("SUCCESS");
            notificationRepository.save(n);
        } catch (Exception e) {
            System.err.println("Kunde inte skapa betygsnotis: " + e.getMessage());
        }
        // --------------------------------

        return ResponseEntity.ok(submission);
    }
}