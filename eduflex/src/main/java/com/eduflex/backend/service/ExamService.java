package com.eduflex.backend.service;

import com.eduflex.backend.dto.ExamBookingRequest;
import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import com.eduflex.backend.service.ai.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExamService {

    private static final Logger logger = LoggerFactory.getLogger(ExamService.class);

    private final CalendarEventRepository calendarEventRepository;
    private final QuizResultRepository quizResultRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final NotificationService notificationService;
    private final GeminiService geminiService;
    private final MessageService messageService;
    private final ObjectMapper objectMapper;
    private final MessageSource messageSource;

    public ExamService(CalendarEventRepository calendarEventRepository,
            QuizResultRepository quizResultRepository,
            QuizRepository quizRepository,
            UserRepository userRepository,
            CourseRepository courseRepository,
            NotificationService notificationService,
            GeminiService geminiService,
            MessageService messageService,
            ObjectMapper objectMapper,
            MessageSource messageSource) {
        this.calendarEventRepository = calendarEventRepository;
        this.quizResultRepository = quizResultRepository;
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.notificationService = notificationService;
        this.geminiService = geminiService;
        this.messageService = messageService;
        this.objectMapper = objectMapper;
        this.messageSource = messageSource;
    }

    /**
     * Boka en tentamen (Tenta Manager logic).
     */
    public CalendarEvent bookExam(ExamBookingRequest request) {
        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // 1. Save Quiz
        Quiz quiz = request.getQuizData();
        quiz.setAuthor(teacher);
        quiz.setCourse(course);
        quiz.setExam(true);
        quiz.setGradingType(quiz.getGradingType() != null ? quiz.getGradingType() : GradingType.MANUAL);

        // Link questions and options to their parents
        if (quiz.getQuestions() != null) {
            for (Question q : quiz.getQuestions()) {
                q.setQuiz(quiz);
                if (q.getOptions() != null) {
                    for (Option o : q.getOptions()) {
                        o.setQuestion(q);
                    }
                }
            }
        }

        Quiz savedQuiz = quizRepository.save(quiz);

        // 2. Create Calendar Event
        CalendarEvent event = new CalendarEvent();
        event.setTitle(messageSource.getMessage("exam.title_prefix", null, LocaleContextHolder.getLocale()) + savedQuiz.getTitle());
        event.setDescription(savedQuiz.getDescription());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setType(CalendarEvent.EventType.EXAM);
        event.setStatus(CalendarEvent.EventStatus.CONFIRMED);
        event.setPlatform(CalendarEvent.EventPlatform.EXAM_ROOM);
        event.setCourse(course);
        event.setOwner(teacher);
        event.setQuizId(savedQuiz.getId());

        // Setup attendees
        Set<User> attendees = new HashSet<>(course.getStudents());
        event.setAttendees(attendees);

        CalendarEvent savedEvent = calendarEventRepository.save(event);

        // 3. Send Notifications
        String message = messageSource.getMessage("exam.booked_message", 
                new Object[]{savedQuiz.getTitle(), request.getStartTime().toString()}, 
                LocaleContextHolder.getLocale());

        for (User student : course.getStudents()) {
            notificationService.createNotification(
                    student.getId(),
                    message,
                    "EXAM_BOOKED",
                    savedEvent.getId(),
                    "CalendarEvent",
                    "/calendar", // Action URL
                    request.isNotifyEmail(),
                    request.isNotifySms(),
                    request.isNotifyPush());

            // Internal message if requested
            if (request.isNotifyInternal()) {
                messageService.sendMessage(
                        teacher.getId(),
                        student.getId(),
                        messageSource.getMessage("exam.invitation_subject", new Object[]{savedQuiz.getTitle()}, LocaleContextHolder.getLocale()),
                        message + "\n\n" + messageSource.getMessage("exam.good_luck", null, LocaleContextHolder.getLocale()),
                        "inbox",
                        null,
                        null);
            }
        }

        return savedEvent;
    }

    /**
     * Checks if an exam is within its 5-minute activation window.
     */
    public boolean isExamActive(Long calendarEventId) {
        CalendarEvent event = calendarEventRepository.findById(calendarEventId).orElse(null);
        if (event == null || event.getType() != CalendarEvent.EventType.EXAM) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime activationTime = event.getStartTime().minusMinutes(5);

        // Active if now is after activationTime and before endTime
        return now.isAfter(activationTime) && now.isBefore(event.getEndTime());
    }

    /**
     * Gets upcoming exams for a student based on their enrolled courses.
     */
    public List<Map<String, Object>> getUpcomingExamsForStudent(User student) {
        LocalDateTime now = LocalDateTime.now();
        List<CalendarEvent> events = calendarEventRepository.findAll(); // Optimization needed: filter in DB

        return events.stream()
                .filter(e -> e.getType() == CalendarEvent.EventType.EXAM)
                .filter(e -> e.getEndTime().isAfter(now))
                .filter(e -> isStudentInCourse(student, e.getCourse()))
                .map(this::mapEventToMap)
                .sorted(Comparator.comparing(m -> (LocalDateTime) m.get("startTime")))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getActiveExamsForTeacher(User teacher) {
        List<CalendarEvent> events = calendarEventRepository.findAll();

        return events.stream()
                .filter(e -> e.getType() == CalendarEvent.EventType.EXAM)
                .filter(e -> isExamActive(e.getId()))
                .filter(e -> e.getCourse() != null && e.getCourse().getTeacher() != null
                        && e.getCourse().getTeacher().getId().equals(teacher.getId()))
                .map(this::mapEventToMap)
                .collect(Collectors.toList());
    }

    private Map<String, Object> mapEventToMap(CalendarEvent e) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", e.getId());
        map.put("title", e.getTitle());
        map.put("startTime", e.getStartTime());
        map.put("endTime", e.getEndTime());
        map.put("courseName", e.getCourse() != null ? e.getCourse().getName() : "N/A");
        map.put("quizId", e.getQuizId());
        map.put("isActive", isExamActive(e.getId()));
        return map;
    }

    private boolean isStudentInCourse(User student, Course course) {
        if (course == null)
            return false;
        return course.getStudents().contains(student);
    }

    /**
     * Grades an exam result using AI (Gemini).
     */
    public Map<String, Object> gradeExamWithAi(Long quizResultId) {
        QuizResult result = quizResultRepository.findById(quizResultId)
                .orElseThrow(() -> new RuntimeException("Quiz result not found"));

        Quiz quiz = result.getQuiz();
        if (quiz == null || quiz.getGradingType() != GradingType.AI) {
            throw new RuntimeException("This quiz is not configured for AI grading");
        }

        logger.info("Starting AI grading for result ID: {}", quizResultId);

        // Prepare data for Gemini
        String prompt = buildAiGradingPrompt(result);
        String aiResponse = geminiService.generateJsonContent(prompt);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> gradingData = objectMapper.readValue(aiResponse, Map.class);

            // Apply grading to result
            result.setTeacherFeedback((String) gradingData.get("generalComment"));
            result.setAnswerFeedbackJson(objectMapper.writeValueAsString(gradingData.get("answers")));

            // Calculate total score based on difficulty points
            double totalScore = ((Number) gradingData.get("totalScore")).doubleValue();
            result.setScore(totalScore);

            quizResultRepository.save(result);

            // Send results via internal mail
            sendResultsToInBox(result);

            return gradingData;
        } catch (Exception e) {
            logger.error("Failed to parse AI grading response", e);
            throw new RuntimeException("AI grading failed during parsing: " + e.getMessage());
        }
    }

    private String buildAiGradingPrompt(QuizResult result) {
        return messageSource.getMessage("ai.grading.prompt.header", 
                new Object[]{result.getQuiz().getTitle(), result.getStudent().getFullName()}, 
                LocaleContextHolder.getLocale());
    }

    public void sendResultsToInBox(QuizResult result) {
        if (result.getStudent() == null || result.getQuiz() == null)
            return;

        String subject = messageSource.getMessage("exam.results_subject", new Object[]{result.getQuiz().getTitle()}, LocaleContextHolder.getLocale());
        String content = messageSource.getMessage("exam.results_body", 
                new Object[]{result.getStudent().getFirstName(), result.getQuiz().getTitle(), result.getScore(), result.getMaxScore(), result.getTeacherFeedback()}, 
                LocaleContextHolder.getLocale());

        // Assuming System user or Quiz author sends the mail
        Long senderId = (result.getQuiz().getAuthor() != null) ? result.getQuiz().getAuthor().getId() : 1L;
        messageService.sendMessage(senderId, result.getStudent().getId(), subject, content, "inbox", null, null);
    }
}
