package com.eduflex.backend.controller;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import com.eduflex.backend.service.StorageService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AssignmentController {

    private final AssignmentRepository assignmentRepo;
    private final SubmissionRepository submissionRepo;
    private final CourseRepository courseRepo;
    private final UserRepository userRepo;
    private final StorageService storageService;

    public AssignmentController(AssignmentRepository assignmentRepo, SubmissionRepository submissionRepo,
            CourseRepository courseRepo, UserRepository userRepo, StorageService storageService) {
        this.assignmentRepo = assignmentRepo;
        this.submissionRepo = submissionRepo;
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
        this.storageService = storageService;
    }

    // --- ASSIGNMENTS ---

    @GetMapping("/courses/{courseId}/assignments")
    public List<Assignment> getAssignments(@PathVariable Long courseId) {
        return assignmentRepo.findByCourseIdOrderByDueDateAsc(courseId);
    }

    @PostMapping("/courses/{courseId}/assignments")
    public Assignment createAssignment(@PathVariable Long courseId, @RequestParam Long userId,
            @RequestBody Assignment req) {
        Course course = courseRepo.findById(courseId).orElseThrow();
        User author = userRepo.findById(userId).orElseThrow();
        req.setCourse(course);
        // Set the author of the assignment
        req.setAuthor(author);
        return assignmentRepo.save(req);
    }

    @PostMapping("/assignments/create")
    public Assignment createGlobalAssignment(@RequestParam Long userId, @RequestBody Assignment req) {
        User author = userRepo.findById(userId).orElseThrow();
        // Set the author
        req.setAuthor(author);
        // Ingen kurs satt
        return assignmentRepo.save(req);
    }

    @GetMapping("/assignments/my")
    public List<Assignment> getMyAssignments(@RequestParam Long userId) {
        return assignmentRepo.findByAuthorId(userId);
    }

    @PutMapping("/assignments/{id}")
    public Assignment updateAssignment(@PathVariable Long id, @RequestBody Assignment req) {
        Assignment assignment = assignmentRepo.findById(id).orElseThrow();
        assignment.setTitle(req.getTitle());
        assignment.setDescription(req.getDescription());
        assignment.setDueDate(req.getDueDate());
        // Add other fields as needed, e.g., type
        return assignmentRepo.save(assignment);
    }

    @DeleteMapping("/assignments/{id}")
    public void deleteAssignment(@PathVariable Long id) {
        assignmentRepo.deleteById(id);
    }

    // --- ATTACHMENTS (NEW) ---

    @PostMapping("/assignments/{id}/attachments/file")
    public Assignment addFileAttachment(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Assignment assignment = assignmentRepo.findById(id).orElseThrow();
        String storageId = storageService.save(file);
        String fileUrl = "/api/storage/" + storageId;

        AssignmentAttachment attachment = new AssignmentAttachment(
                file.getOriginalFilename(),
                "FILE",
                fileUrl,
                assignment);

        assignment.getAttachments().add(attachment);
        return assignmentRepo.save(assignment);
    }

    @PostMapping("/assignments/{id}/attachments/link")
    public Assignment addLinkAttachment(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        Assignment assignment = assignmentRepo.findById(id).orElseThrow();

        String title = payload.getOrDefault("title", "Länk");
        String url = payload.get("url");
        String type = payload.getOrDefault("type", "LINK"); // LINK, YOUTUBE, RESOURCE

        AssignmentAttachment attachment = new AssignmentAttachment(title, type, url, assignment);

        assignment.getAttachments().add(attachment);
        return assignmentRepo.save(assignment);
    }

    @DeleteMapping("/assignments/{id}/attachments/{attachmentId}")
    public Assignment removeAttachment(@PathVariable Long id, @PathVariable Long attachmentId) {
        Assignment assignment = assignmentRepo.findById(id).orElseThrow();
        assignment.getAttachments().removeIf(a -> a.getId().equals(attachmentId));
        return assignmentRepo.save(assignment);
    }

    // --- SUBMISSIONS ---

    @GetMapping("/assignments/{assignmentId}/submissions")
    public List<Submission> getSubmissions(@PathVariable Long assignmentId) {
        return submissionRepo.findByAssignmentId(assignmentId);
    }

    @GetMapping("/assignments/{assignmentId}/my-submission/{studentId}")
    public Submission getMySubmission(@PathVariable Long assignmentId, @PathVariable Long studentId) {
        return submissionRepo.findByAssignmentIdAndStudentId(assignmentId, studentId).orElse(null);
    }

    @PostMapping("/assignments/{assignmentId}/submit/{studentId}")
    public Submission submitAssignment(@PathVariable Long assignmentId, @PathVariable Long studentId,
            @RequestParam("file") MultipartFile file) {
        Assignment assignment = assignmentRepo.findById(assignmentId).orElseThrow();
        User student = userRepo.findById(studentId).orElseThrow();

        // Ladda upp filen
        String storageId = storageService.save(file);
        String fileUrl = "/api/storage/" + storageId; // Returnerar URL path

        // Kolla om inlämning redan finns, uppdatera isf
        Submission submission = submissionRepo.findByAssignmentIdAndStudentId(assignmentId, studentId)
                .orElse(new Submission());

        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setFileUrl(fileUrl);
        submission.setFileName(file.getOriginalFilename());
        submission.setSubmittedAt(LocalDateTime.now());

        // Återställ betyg vid ny inlämning om du vill, eller behåll
        // submission.setGrade(null);

        return submissionRepo.save(submission);
    }

    // --- GRADING ---

    @PostMapping("/submissions/{id}/grade")
    public Submission gradeSubmission(@PathVariable Long id, @RequestParam String grade,
            @RequestParam(required = false) String feedback) {
        Submission sub = submissionRepo.findById(id).orElseThrow();
        sub.setGrade(grade);
        sub.setFeedback(feedback);
        return submissionRepo.save(sub);
    }

    @GetMapping("/submissions/student/{studentId}/course/{courseId}")
    public List<Submission> getCourseSubmissionsForStudent(@PathVariable Long studentId, @PathVariable Long courseId) {
        return submissionRepo.findByStudentIdAndAssignmentCourseId(studentId, courseId);
    }
}