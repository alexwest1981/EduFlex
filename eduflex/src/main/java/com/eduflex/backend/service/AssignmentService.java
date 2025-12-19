package com.eduflex.backend.service;

import com.eduflex.backend.dto.AssignmentDTO;
import com.eduflex.backend.dto.SubmissionDTO;
import com.eduflex.backend.model.Assignment;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.Submission;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.AssignmentRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.SubmissionRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final Path fileStorageLocation;

    public AssignmentService(AssignmentRepository assignmentRepo, SubmissionRepository submissionRepo,
                             CourseRepository courseRepo, UserRepository userRepo) {
        this.assignmentRepository = assignmentRepo;
        this.submissionRepository = submissionRepo;
        this.courseRepository = courseRepo;
        this.userRepository = userRepo;

        this.fileStorageLocation = Paths.get("uploads/submissions").toAbsolutePath().normalize();
        try { Files.createDirectories(this.fileStorageLocation); }
        catch (Exception ex) { throw new RuntimeException("Kunde inte skapa mapp för inlämningar.", ex); }
    }

    public Assignment createAssignment(Long courseId, String title, String description, LocalDateTime dueDate) {
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Kurs hittades inte"));
        Assignment assignment = new Assignment();
        assignment.setTitle(title);
        assignment.setDescription(description);
        assignment.setDueDate(dueDate);
        assignment.setCourse(course);
        return assignmentRepository.save(assignment);
    }

    public List<AssignmentDTO> getAssignmentsForCourse(Long courseId) {
        return assignmentRepository.findByCourseId(courseId).stream()
                .map(a -> new AssignmentDTO(a.getId(), a.getTitle(), a.getDescription(), a.getDueDate(), courseId))
                .collect(Collectors.toList());
    }

    public Submission submitAssignment(Long assignmentId, Long studentId, MultipartFile file) {
        Assignment assignment = assignmentRepository.findById(assignmentId).orElseThrow(() -> new RuntimeException("Uppgift hittades inte"));
        User student = userRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Elev hittades inte"));

        // Kolla om inlämning redan finns (vi tillåter ominlämning genom att skriva över, eller kasta fel)
        Submission submission = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId)
                .orElse(new Submission());

        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setSubmittedAt(LocalDateTime.now());

        if (file != null && !file.isEmpty()) {
            String originalName = StringUtils.cleanPath(file.getOriginalFilename());
            // Unikt filnamn: studentId_assignmentId_filnamn
            String fileName = studentId + "_" + assignmentId + "_" + originalName;
            try {
                Path target = this.fileStorageLocation.resolve(fileName);
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                submission.setFileName(originalName);
                submission.setFileType(file.getContentType());
                submission.setFileUrl("/uploads/submissions/" + fileName);
            } catch (IOException ex) { throw new RuntimeException("Kunde inte spara fil", ex); }
        }
        return submissionRepository.save(submission);
    }

    public List<SubmissionDTO> getSubmissionsForAssignment(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(s -> new SubmissionDTO(
                        s.getId(),
                        s.getAssignment().getId(),
                        s.getStudent().getId(),
                        s.getStudent().getFullName(),
                        s.getFileName(),
                        s.getFileUrl(),
                        s.getSubmittedAt(),
                        s.getGrade(),
                        s.getFeedback()))
                .collect(Collectors.toList());
    }

    public Submission gradeSubmission(Long submissionId, String grade, String feedback) {
        Submission submission = submissionRepository.findById(submissionId).orElseThrow(() -> new RuntimeException("Inlämning hittades inte"));
        submission.setGrade(grade);
        submission.setFeedback(feedback);
        return submissionRepository.save(submission);
    }
}