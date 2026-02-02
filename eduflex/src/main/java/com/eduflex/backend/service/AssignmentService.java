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
    private final com.eduflex.backend.service.GamificationService gamificationService;
    private final com.eduflex.backend.service.AchievementService achievementService;
    private final com.eduflex.backend.service.StudentActivityService studentActivityService;
    private final com.eduflex.backend.service.ai.EduAIService eduAIService;
    private final Path fileStorageLocation;

    public AssignmentService(AssignmentRepository assignmentRepo, SubmissionRepository submissionRepo,
            CourseRepository courseRepo, UserRepository userRepo,
            com.eduflex.backend.service.GamificationService gamificationService,
            com.eduflex.backend.service.AchievementService achievementService,
            com.eduflex.backend.service.StudentActivityService studentActivityService,
            com.eduflex.backend.service.ai.EduAIService eduAIService) {
        this.assignmentRepository = assignmentRepo;
        this.submissionRepository = submissionRepo;
        this.courseRepository = courseRepo;
        this.userRepository = userRepo;
        this.gamificationService = gamificationService;
        this.achievementService = achievementService;
        this.studentActivityService = studentActivityService;
        this.eduAIService = eduAIService;

        this.fileStorageLocation = Paths.get("uploads/submissions").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Kunde inte skapa mapp för inlämningar.", ex);
        }
    }

    public Assignment createAssignment(Long courseId, String title, String description, LocalDateTime dueDate) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Kurs hittades inte"));
        Assignment assignment = new Assignment();
        assignment.setTitle(title);
        assignment.setDescription(description);
        assignment.setDueDate(dueDate);
        assignment.setCourse(course);
        return assignmentRepository.save(assignment);
    }

    // NY METOD: Skapa med DTO/Gamification fields
    public Assignment createAssignment(Long courseId, Assignment assignmentData) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Kurs hittades inte"));
        assignmentData.setCourse(course);
        return assignmentRepository.save(assignmentData);
    }

    // NY METOD: Uppdatera med DTO
    public Assignment updateAssignment(Long id, Assignment updatedData) {
        Assignment existing = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Uppgift hittades inte"));
        existing.setTitle(updatedData.getTitle());
        existing.setDescription(updatedData.getDescription());
        existing.setDueDate(updatedData.getDueDate());

        // Gamification updates
        existing.setXpReward(updatedData.getXpReward());
        existing.setXpMultiplier(updatedData.getXpMultiplier());
        existing.setTimeBonusMinutes(updatedData.getTimeBonusMinutes());
        existing.setTimeBonusXp(updatedData.getTimeBonusXp());
        existing.setShowOnLeaderboard(updatedData.getShowOnLeaderboard());

        return assignmentRepository.save(existing);
    }

    public List<AssignmentDTO> getAssignmentsForCourse(Long courseId) {
        return assignmentRepository.findByCourseId(courseId).stream()
                .map(a -> new AssignmentDTO(a.getId(), a.getTitle(), a.getDescription(), a.getDueDate(), courseId))
                .collect(Collectors.toList());
        // Note: AssignmentDTO should ideally include gamification fields, but frontend
        // fetches full entity often.
    }

    public Submission submitAssignment(Long assignmentId, Long studentId, MultipartFile file) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Uppgift hittades inte"));
        User student = userRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Elev hittades inte"));

        // Kolla om inlämning redan finns (vi tillåter ominlämning genom att skriva
        // över, eller kasta fel)
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
            } catch (IOException ex) {
                throw new RuntimeException("Kunde inte spara fil", ex);
            }
        }
        Submission saved = submissionRepository.save(submission);

        // LOGGA AKTIVITET FÖR AI
        studentActivityService.logActivity(studentId, assignment.getCourse().getId(), null,
                com.eduflex.backend.model.StudentActivityLog.ActivityType.ASSIGNMENT_SUBMISSION,
                "Lämnade in uppgift: " + assignment.getTitle());

        // Trigger Achievement: Submission Count
        try {
            int count = submissionRepository.findByStudentId(studentId).size();
            achievementService.checkAndUnlock(studentId, "submission_count", count);
        } catch (Exception e) {
            // ignore
        }

        // --- EDUAI TRIGGER ---
        eduAIService.checkAndCompleteQuest(studentId,
                com.eduflex.backend.model.EduAIQuest.QuestObjectiveType.ASSIGNMENT, assignmentId);
        // ---------------------

        return saved;
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
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Inlämning hittades inte"));
        String oldGrade = submission.getGrade();
        submission.setGrade(grade);
        submission.setFeedback(feedback);

        Submission savedSubmission = submissionRepository.save(submission);

        // GAMIFICATION LOGIC: Award XP if passed (G or VG) and grade wasn't already
        // passing
        boolean isPassing = "G".equals(grade) || "VG".equals(grade);
        boolean wasPassing = "G".equals(oldGrade) || "VG".equals(oldGrade);

        if (isPassing && !wasPassing) {
            Assignment assignment = submission.getAssignment();
            int baseXP = assignment.getXpReward() != null ? assignment.getXpReward() : 100;
            double multiplier = assignment.getXpMultiplier() != null ? assignment.getXpMultiplier() : 1.0;

            int totalXP = (int) (baseXP * multiplier);

            // Time Bonus Check
            if (assignment.getTimeBonusMinutes() != null && assignment.getTimeBonusMinutes() > 0
                    && assignment.getTimeBonusXp() != null && assignment.getTimeBonusXp() > 0) {

                LocalDateTime bonusDeadline = assignment.getDueDate().minusMinutes(assignment.getTimeBonusMinutes());
                // If submitted BEFORE strict deadline minus bonus buffer
                if (submission.getSubmittedAt().isBefore(bonusDeadline)) {
                    totalXP += assignment.getTimeBonusXp();
                }
            }

            gamificationService.addPoints(submission.getStudent().getId(), totalXP);
        }

        return savedSubmission;
    }
}