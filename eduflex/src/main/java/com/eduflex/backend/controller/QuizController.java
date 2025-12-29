package com.eduflex.backend.controller;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
// 👇 HÄR ÄR RADEN SOM SAKNADES I DIN FIL 👇
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class QuizController {

    private final QuizRepository quizRepository;
    private final QuizResultRepository resultRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public QuizController(QuizRepository q, QuizResultRepository r, CourseRepository c, UserRepository u) {
        this.quizRepository = q;
        this.resultRepository = r;
        this.courseRepository = c;
        this.userRepository = u;
    }

    @GetMapping("/course/{courseId}")
    public List<Quiz> getQuizzesByCourse(@PathVariable Long courseId) {
        return quizRepository.findByCourseId(courseId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable Long id, @RequestBody Quiz quizData) {
        Quiz existingQuiz = quizRepository.findById(id).orElseThrow();

        // 1. Uppdatera enkla fält
        existingQuiz.setTitle(quizData.getTitle());
        existingQuiz.setDescription(quizData.getDescription());

        // 2. Hantera frågorna
        if (existingQuiz.getQuestions() == null) {
            existingQuiz.setQuestions(new ArrayList<>());
        } else {
            existingQuiz.getQuestions().clear();
        }

        if (quizData.getQuestions() != null) {
            for (Question q : quizData.getQuestions()) {
                q.setQuiz(existingQuiz); // Sätt relationen
                if (q.getOptions() != null) {
                    for (Option o : q.getOptions()) {
                        o.setQuestion(q); // Sätt relationen för alternativen
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

        return ResponseEntity.ok(resultRepository.save(result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Long id) {
        quizRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}