package com.eduflex.backend.controller;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import com.eduflex.backend.service.GamificationService; // <--- NY IMPORT
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class QuizController {

    private final QuizRepository quizRepository;
    private final QuizResultRepository resultRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final GamificationService gamificationService;

    public QuizController(QuizRepository q, QuizResultRepository r, CourseRepository c, UserRepository u, GamificationService g) {
        this.quizRepository = q;
        this.resultRepository = r;
        this.courseRepository = c;
        this.userRepository = u;
        this.gamificationService = g; // <--- INJICERA HÄR
    }

    @GetMapping("/course/{courseId}")
    public List<Quiz> getQuizzesByCourse(@PathVariable Long courseId) {
        return quizRepository.findByCourseId(courseId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable Long id, @RequestBody Quiz quizData) {
        Quiz existingQuiz = quizRepository.findById(id).orElseThrow();

        existingQuiz.setTitle(quizData.getTitle());
        existingQuiz.setDescription(quizData.getDescription());

        if (existingQuiz.getQuestions() == null) {
            existingQuiz.setQuestions(new ArrayList<>());
        } else {
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

        return ResponseEntity.ok(quizRepository.save(existingQuiz));
    }

    @PostMapping("/course/{courseId}")
    public ResponseEntity<Quiz> createQuiz(@PathVariable Long courseId, @RequestBody Quiz quizData) {
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

        return ResponseEntity.ok(quizRepository.save(quizData));
    }

    @PostMapping("/{quizId}/submit")
    public ResponseEntity<QuizResult> submitResult(@PathVariable Long quizId, @RequestBody Map<String, Object> payload) {
        Long studentId = Long.valueOf(payload.get("studentId").toString());
        int score = Integer.parseInt(payload.get("score").toString());
        int maxScore = Integer.parseInt(payload.get("maxScore").toString());

        Quiz quiz = quizRepository.findById(quizId).orElseThrow();
        User student = userRepository.findById(studentId).orElseThrow();

        QuizResult result = new QuizResult();
        result.setQuiz(quiz);
        result.setStudent(student);
        result.setScore(score);
        result.setMaxScore(maxScore);

        QuizResult savedResult = resultRepository.save(result);

        if (score > 0) {
            // Ge 10 poäng per rätt svar
            gamificationService.addPoints(studentId, score * 10);
        }

        // Om maxpoäng: Ge 'Quiz Master' badge (ID 2 i vår init-lista) + 50 bonuspoäng
        if (score == maxScore && maxScore > 0) {
            gamificationService.addPoints(studentId, 50);

            // Hämta badge baserat på namn istället för hårdkodat ID 2 för säkerhets skull
            // Men för nu kör vi ID 2 då vi vet att initBadges skapar den som nr 2.
            try {
                gamificationService.awardBadge(studentId, 2L);
            } catch (Exception e) {
                System.err.println("Kunde inte dela ut badge: " + e.getMessage());
            }
        }

        return ResponseEntity.ok(savedResult);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Long id) {
        quizRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}