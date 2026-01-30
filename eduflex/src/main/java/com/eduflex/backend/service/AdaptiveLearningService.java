package com.eduflex.backend.service;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import com.eduflex.backend.service.ai.AITutorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AdaptiveLearningService {

    private static final Logger logger = LoggerFactory.getLogger(AdaptiveLearningService.class);

    private final AnalyticsService analyticsService;
    private final AITutorService aiTutorService;
    private final StudentRecommendationRepository recommendationRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final StudentActivityLogRepository activityLogRepository;

    public AdaptiveLearningService(AnalyticsService analyticsService,
            AITutorService aiTutorService,
            StudentRecommendationRepository recommendationRepository,
            UserRepository userRepository,
            CourseRepository courseRepository,
            LessonRepository lessonRepository,
            StudentActivityLogRepository activityLogRepository) {
        this.analyticsService = analyticsService;
        this.aiTutorService = aiTutorService;
        this.recommendationRepository = recommendationRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.activityLogRepository = activityLogRepository;
    }

    // Run every night at 02:00
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void runDailyAnalysis() {
        logger.info("Starting daily Adaptive Learning analysis...");
        List<Map<String, Object>> atRiskStudents = analyticsService.getAtRiskStudents();

        for (Map<String, Object> studentData : atRiskStudents) {
            try {
                processAtRiskStudent(studentData);
            } catch (Exception e) {
                logger.error("Failed to process recommendation for student {}", studentData.get("name"), e);
            }
        }
        logger.info("Adaptive Learning analysis completed.");
    }

    public void triggerManualAnalysis() {
        runDailyAnalysis();
    }

    private void processAtRiskStudent(Map<String, Object> studentData) {
        Long studentId = ((Number) studentData.get("id")).longValue();
        User student = userRepository.findById(studentId).orElse(null);
        if (student == null)
            return;

        // Check if we already gave a recommendation recently (e.g. last 3 days)
        // For MVP, we just check if they have ANY unviewed recommendations
        List<StudentRecommendation> pending = recommendationRepository.findByUserIdAndIsViewedFalse(studentId);
        if (!pending.isEmpty()) {
            logger.info("Student {} already has pending recommendations. Skipping.", student.getEmail());
            return;
        }

        // Find the course they are struggling with (simplification: take their first
        // active course)
        // In a real scenario, we would check which specific course caused the "High"
        // risk
        if (student.getCourses().isEmpty())
            return;
        Course course = student.getCourses().iterator().next(); // Grab first course

        // Find the "Next Lesson" they haven't completed
        Optional<Lesson> stuckLesson = findStuckLesson(course, student);

        if (stuckLesson.isPresent()) {
            Lesson lesson = stuckLesson.get();
            logger.info("Generating AI study tip for {} on lesson {}", student.getEmail(), lesson.getTitle());

            String aiTip = aiTutorService.generateStudyTip(lesson, student);

            StudentRecommendation rec = new StudentRecommendation(
                    student,
                    course,
                    StudentRecommendation.RecommendationType.TIP,
                    aiTip);
            rec.setLessonId(lesson.getId());
            rec.setLessonTitle(lesson.getTitle());

            recommendationRepository.save(rec);
        }
    }

    private Optional<Lesson> findStuckLesson(Course course, User student) {
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderBySortOrderAsc(course.getId());

        for (Lesson lesson : lessons) {
            // Check if completed (using same logic as AnalyticsService: VIEW_LESSON log
            // exists)
            boolean isCompleted = activityLogRepository
                    .findByCourseIdAndUserIdOrderByTimestampDesc(course.getId(), student.getId())
                    .stream()
                    .anyMatch(l -> l.getActivityType() == StudentActivityLog.ActivityType.VIEW_LESSON
                            && l.getDetails() != null
                            && l.getDetails().contains(lesson.getTitle()));

            if (!isCompleted) {
                return Optional.of(lesson);
            }
        }
        return Optional.empty();
    }
}
