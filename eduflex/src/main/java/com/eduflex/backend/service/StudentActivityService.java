package com.eduflex.backend.service;

import com.eduflex.backend.dto.StudentActivityLogDTO;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CourseMaterial;
import com.eduflex.backend.model.StudentActivityLog;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseMaterialRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.StudentActivityLogRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentActivityService {

    private final StudentActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CourseMaterialRepository materialRepository;
    private final com.eduflex.backend.repository.StudentQuizLogRepository studentQuizLogRepository;
    private final GamificationService gamificationService;
    private final com.eduflex.backend.service.ai.EduAIService eduAIService;
    private final EduAiHubService eduAiHubService;

    public StudentActivityService(StudentActivityLogRepository activityLogRepository,
            UserRepository userRepository,
            CourseRepository courseRepository,
            CourseMaterialRepository materialRepository,
            com.eduflex.backend.repository.StudentQuizLogRepository studentQuizLogRepository,
            GamificationService gamificationService,
            com.eduflex.backend.service.ai.EduAIService eduAIService,
            EduAiHubService eduAiHubService) {
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.materialRepository = materialRepository;
        this.studentQuizLogRepository = studentQuizLogRepository;
        this.gamificationService = gamificationService;
        this.eduAIService = eduAIService;
        this.eduAiHubService = eduAiHubService;
    }

    @Transactional
    public void logActivity(Long userId, Long courseId, Long materialId, StudentActivityLog.ActivityType type,
            String details) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        Course course = null;
        if (courseId != null) {
            course = courseRepository.findById(courseId).orElse(null);
        }

        CourseMaterial material = null;
        if (materialId != null) {
            material = materialRepository.findById(materialId).orElse(null);
        }

        StudentActivityLog log = new StudentActivityLog(user, course, material, type, details);
        activityLogRepository.save(log);

        // --- GAMIFICATION TRIGGERS ---
        awardPointsForActivity(userId, type);

        // --- EDUAI QUEST TRIGGER ---
        if (type == StudentActivityLog.ActivityType.VIEW_LESSON && materialId != null) {
            eduAIService.checkAndCompleteQuest(userId, com.eduflex.backend.model.EduAIQuest.QuestObjectiveType.LESSON,
                    materialId);

            // Add to Spaced Repetition Hub
            if (material != null) {
                eduAiHubService.addKnowledgeFragment(user, material.getTitle(), material.getContent(), "LESSON",
                        materialId);
            }
        }
    }

    private void awardPointsForActivity(Long userId, StudentActivityLog.ActivityType type) {
        int points = switch (type) {
            case VIEW_LESSON -> 5;
            case WATCH_VIDEO -> 10;
            case DOWNLOAD_FILE -> 5;
            case EBOOK_READ -> 15;
            default -> 0;
        };

        if (points > 0) {
            gamificationService.addPoints(userId, points);
        }
    }

    @Transactional(readOnly = true)
    public List<StudentActivityLogDTO> getCourseLogs(Long courseId) {
        List<StudentActivityLogDTO> activityLogs = activityLogRepository.findByCourseIdOrderByTimestampDesc(courseId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        List<StudentActivityLogDTO> quizLogs = studentQuizLogRepository.findByCourseId(courseId).stream()
                .map(this::convertQuizToDTO)
                .collect(Collectors.toList());

        activityLogs.addAll(quizLogs);
        activityLogs.sort((a, b) -> b.timestamp().compareTo(a.timestamp()));
        return activityLogs;
    }

    @Transactional(readOnly = true)
    public List<StudentActivityLogDTO> getStudentLogs(Long courseId, Long userId) {
        List<StudentActivityLogDTO> activityLogs = activityLogRepository
                .findByCourseIdAndUserIdOrderByTimestampDesc(courseId, userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        List<StudentActivityLogDTO> quizLogs = studentQuizLogRepository.findByCourseIdAndStudentId(courseId, userId)
                .stream()
                .map(this::convertQuizToDTO)
                .collect(Collectors.toList());

        activityLogs.addAll(quizLogs);
        activityLogs.sort((a, b) -> b.timestamp().compareTo(a.timestamp()));
        return activityLogs;
    }

    @Transactional(readOnly = true)
    public List<StudentActivityLogDTO> getGlobalStudentLogs(Long userId) {
        List<StudentActivityLogDTO> activityLogs = activityLogRepository.findByUserIdOrderByTimestampDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        List<StudentActivityLogDTO> quizLogs = studentQuizLogRepository.findByStudentId(userId).stream()
                .map(this::convertQuizToDTO)
                .collect(Collectors.toList());

        activityLogs.addAll(quizLogs);
        activityLogs.sort((a, b) -> b.timestamp().compareTo(a.timestamp()));
        return activityLogs;
    }

    private StudentActivityLogDTO convertToDTO(StudentActivityLog log) {
        return new StudentActivityLogDTO(
                log.getId(),
                log.getUser().getId(),
                log.getUser().getFirstName() + " " + log.getUser().getLastName(),
                log.getActivityType().name(),
                log.getDetails(),
                log.getTimestamp(),
                log.getMaterial() != null ? log.getMaterial().getTitle() : null);
    }

    private StudentActivityLogDTO convertQuizToDTO(com.eduflex.backend.model.StudentQuizLog log) {
        String details = String.format("Resultat: %d/%d (Svårighetsgrad: %d)",
                log.getScore(), log.getMaxScore(), log.getDifficulty());

        return new StudentActivityLogDTO(
                log.getId(),
                log.getStudent().getId(),
                log.getStudent().getFirstName() + " " + log.getStudent().getLastName(),
                "PRACTICE_QUIZ",
                details,
                log.getTimestamp(),
                "Övningsquiz: " + log.getTopic());
    }
}
