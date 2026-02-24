package com.eduflex.backend.service;

import com.eduflex.backend.model.ExamIntegrityEvent;
import com.eduflex.backend.model.Quiz;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.ExamIntegrityRepository;
import com.eduflex.backend.repository.QuizRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ExamIntegrityService {
    private static final String TOPIC_PROCTORING = "/topic/proctoring";

    private final ExamIntegrityRepository integrityRepository;
    private final NotificationService notificationService;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public ExamIntegrityService(ExamIntegrityRepository integrityRepository,
            NotificationService notificationService,
            QuizRepository quizRepository,
            UserRepository userRepository,
            org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate) {
        this.integrityRepository = integrityRepository;
        this.notificationService = notificationService;
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public ExamIntegrityEvent logEvent(ExamIntegrityEvent event) {
        // Enrich before saving/broadcasting
        enrichEvent(event);

        ExamIntegrityEvent savedEvent = integrityRepository.save(event);

        // Broadcast to proctoring dashboard in real-time
        messagingTemplate.convertAndSend(TOPIC_PROCTORING, savedEvent);
        messagingTemplate.convertAndSend(TOPIC_PROCTORING + "/" + event.getQuizId(), savedEvent);

        // Notify Teacher if it's a critical integrity issue
        if (event.getEventType() == ExamIntegrityEvent.IntegrityEventType.FOCUS_LOST ||
                event.getEventType() == ExamIntegrityEvent.IntegrityEventType.TAB_SWITCH ||
                event.getEventType() == ExamIntegrityEvent.IntegrityEventType.VIDEO_INTEGRITY_BREACH) {

            triggerTeacherNotification(event);
        }

        return savedEvent;
    }

    private void triggerTeacherNotification(ExamIntegrityEvent event) {
        Quiz quiz = quizRepository.findById(event.getQuizId()).orElse(null);
        User student = userRepository.findById(event.getStudentId()).orElse(null);

        if (quiz != null && quiz.getAuthor() != null && student != null) {
            String message = String.format("⚠️ Integrity Alert: %s just lost focus during the exam '%s' (%s)",
                    student.getFullName(), quiz.getTitle(), event.getEventType());

            notificationService.createNotification(
                    quiz.getAuthor().getId(),
                    message,
                    "INTEGRITY_ALERT",
                    event.getQuizId(),
                    "QUIZ",
                    "/principal/exams/" + quiz.getId());
        }
    }

    public List<ExamIntegrityEvent> getEventsForQuiz(Long quizId) {
        List<ExamIntegrityEvent> events = integrityRepository.findByQuizId(quizId);
        enrichEvents(events);
        return events;
    }

    public List<ExamIntegrityEvent> getEventsForStudentInQuiz(Long quizId, Long studentId) {
        List<ExamIntegrityEvent> events = integrityRepository.findByQuizIdAndStudentId(quizId, studentId);
        enrichEvents(events);
        return events;
    }

    public List<ExamIntegrityEvent> getMostRecentEventsForQuizzes(List<Long> quizIds) {
        List<ExamIntegrityEvent> events = integrityRepository.findByQuizIdInOrderByTimestampDesc(quizIds);
        enrichEvents(events);
        return events;
    }

    private void enrichEvents(List<ExamIntegrityEvent> events) {
        for (ExamIntegrityEvent event : events) {
            enrichEvent(event);
        }
    }

    private void enrichEvent(ExamIntegrityEvent event) {
        if (event.getStudentName() == null) {
            userRepository.findById(event.getStudentId()).ifPresent(u -> event.setStudentName(u.getFullName()));
        }
        if (event.getQuizTitle() == null) {
            quizRepository.findById(event.getQuizId()).ifPresent(q -> event.setQuizTitle(q.getTitle()));
        }
    }
}
