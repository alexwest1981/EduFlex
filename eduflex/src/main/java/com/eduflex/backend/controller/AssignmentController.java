package com.eduflex.backend.controller;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import com.eduflex.backend.service.FileStorageService; // Antar att denna finns sen tidigare (DocumentService)
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AssignmentController {

    private final AssignmentRepository assignmentRepo;
    private final SubmissionRepository submissionRepo;
    private final CourseRepository courseRepo;
    private final UserRepository userRepo;
    private final FileStorageService fileService; // Återanvänd din filtjänst

    public AssignmentController(AssignmentRepository assignmentRepo, SubmissionRepository submissionRepo,
                                CourseRepository courseRepo, UserRepository userRepo, FileStorageService fileService) {
        this.assignmentRepo = assignmentRepo;
        this.submissionRepo = submissionRepo;
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
        this.fileService = fileService;
    }

    // --- ASSIGNMENTS ---

    @GetMapping("/courses/{courseId}/assignments")
    public List<Assignment> getAssignments(@PathVariable Long courseId) {
        return assignmentRepo.findByCourseIdOrderByDueDateAsc(courseId);
    }

    @PostMapping("/courses/{courseId}/assignments")
    public Assignment createAssignment(@PathVariable Long courseId, @RequestBody Assignment req) {
        Course course = courseRepo.findById(courseId).orElseThrow();
        req.setCourse(course);
        return assignmentRepo.save(req);
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
        String fileUrl = fileService.storeFile(file); // Returnerar URL path

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
    public Submission gradeSubmission(@PathVariable Long id, @RequestParam String grade, @RequestParam(required = false) String feedback) {
        Submission sub = submissionRepo.findById(id).orElseThrow();
        sub.setGrade(grade);
        sub.setFeedback(feedback);
        return submissionRepo.save(sub);
    }
}