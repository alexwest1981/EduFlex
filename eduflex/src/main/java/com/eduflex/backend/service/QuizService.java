package com.eduflex.backend.service;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizResultRepository resultRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    // NYTT: Injicera GamificationService och StudentActivityService
    private final GamificationService gamificationService;
    private final StudentActivityService studentActivityService;

    public QuizService(QuizRepository quizRepository,
            QuizResultRepository resultRepository,
            CourseRepository courseRepository,
            UserRepository userRepository,
            GamificationService gamificationService,
            StudentActivityService studentActivityService) { // <--- Lägg till här i konstruktorn
        this.quizRepository = quizRepository;
        this.resultRepository = resultRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.gamificationService = gamificationService;
        this.studentActivityService = studentActivityService;
    }

    public List<Quiz> getQuizzesByCourse(Long courseId) {
        return quizRepository.findByCourseId(courseId);
    }

    public Quiz createQuiz(Long courseId, Quiz quizData) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        quizData.setCourse(course);

        if (quizData.getQuestions() != null) {
            for (Question q : quizData.getQuestions()) {
                q.setQuiz(quizData);
                if (q.getOptions() != null) {
                    for (Option o : q.getOptions()) {
                        o.setQuestion(q);
                    }
                }
            }
        }
        return quizRepository.save(quizData);
    }

    public Quiz updateQuiz(Long id, Quiz quizData) {
        Quiz existingQuiz = quizRepository.findById(id).orElseThrow();
        existingQuiz.setTitle(quizData.getTitle());
        existingQuiz.setDescription(quizData.getDescription());

        if (existingQuiz.getQuestions() != null) {
            existingQuiz.getQuestions().clear();
        }

        if (quizData.getQuestions() != null) {
            for (Question q : quizData.getQuestions()) {
                q.setQuiz(existingQuiz);
                if (q.getOptions() != null) {
                    for (Option o : q.getOptions()) {
                        o.setQuestion(q);
                    }
                }
                existingQuiz.getQuestions().add(q);
            }
        }
        return quizRepository.save(existingQuiz);
    }

    public QuizResult submitQuiz(Long quizId, Long studentId, Map<Long, Long> answers) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow();
        User student = userRepository.findById(studentId).orElseThrow();

        int score = 0;
        int maxScore = quiz.getQuestions() != null ? quiz.getQuestions().size() : 0;

        if (quiz.getQuestions() != null) {
            for (Question q : quiz.getQuestions()) {
                Long selectedOptionId = answers.get(q.getId());
                if (selectedOptionId != null && q.getOptions() != null) {
                    boolean isCorrect = q.getOptions().stream()
                            .anyMatch(o -> o.getId().equals(selectedOptionId) && o.isCorrect());
                    if (isCorrect)
                        score++;
                }
            }
        }

        // Spara resultatet
        QuizResult result = new QuizResult();
        result.setQuiz(quiz);
        result.setStudent(student);
        result.setScore(score);
        result.setMaxScore(maxScore);

        QuizResult savedResult = resultRepository.save(result);

        // LOGGA AKTIVITET FÖR AI
        studentActivityService.logActivity(studentId, quiz.getCourse().getId(), null,
                StudentActivityLog.ActivityType.QUIZ_ATTEMPT,
                String.format("Genomförde quiz: %s. Resultat: %d/%d", quiz.getTitle(), score, maxScore));

        // --- GAMIFICATION TRIGGERS ---
        // Ge 10 poäng per rätt svar
        if (score > 0) {
            gamificationService.addPoints(studentId, score * 10);
        }

        // Bonus: Om man fick alla rätt, ge en Badge (ID 2 = "Quiz Master" som vi
        // skapade i init)
        if (score == maxScore && maxScore > 0) {
            // Ge extra 50 bonuspoäng för perfekt resultat
            gamificationService.addPoints(studentId, 50);

            // Dela ut utmärkelse (Hårdkodat ID 2 för detta exempel)
            gamificationService.awardBadge(studentId, 2L);
        }
        // -----------------------------

        return savedResult;
    }

    public void deleteQuiz(Long id) {
        quizRepository.deleteById(id);
    }
}