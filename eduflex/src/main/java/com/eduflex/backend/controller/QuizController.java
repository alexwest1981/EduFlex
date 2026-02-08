package com.eduflex.backend.controller;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import com.eduflex.backend.service.GamificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
        RequestMethod.DELETE })
public class QuizController {

    private final QuizRepository quizRepository;
    private final QuizResultRepository resultRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final GamificationService gamificationService;
    private final QuestionBankRepository bankRepo;

    public QuizController(QuizRepository q, QuizResultRepository r, CourseRepository c, UserRepository u,
            GamificationService g, QuestionBankRepository b) {
        this.quizRepository = q;
        this.resultRepository = r;
        this.courseRepository = c;
        this.userRepository = u;
        this.gamificationService = g;
        this.bankRepo = b;
    }

    @GetMapping("/course/{courseId}")
    public List<Quiz> getQuizzesByCourse(@PathVariable Long courseId) {
        return quizRepository.findByCourseId(courseId);
    }

    @GetMapping
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    @GetMapping("/my")
    public List<Quiz> getMyQuizzes(@RequestParam Long userId) {
        return quizRepository.findByAuthorId(userId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable Long id, @RequestBody Quiz quizData) {
        Quiz existingQuiz = quizRepository.findById(id).orElseThrow();

        existingQuiz.setTitle(quizData.getTitle());
        existingQuiz.setDescription(quizData.getDescription());
        existingQuiz.setAvailableFrom(quizData.getAvailableFrom());
        existingQuiz.setAvailableTo(quizData.getAvailableTo());

        if (quizData.getCourse() != null) {
            existingQuiz.setCourse(quizData.getCourse());
        }

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

    @PostMapping("/create")
    public ResponseEntity<Quiz> createGlobalQuiz(@RequestParam Long userId,
            @RequestParam(required = false) Long courseId, @RequestBody Quiz quizData) {
        User author = userRepository.findById(userId).orElseThrow();
        quizData.setAuthor(author);

        if (courseId != null) {
            Course course = courseRepository.findById(courseId).orElseThrow();
            quizData.setCourse(course);
        }

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

    @PostMapping("/course/{courseId}")
    public ResponseEntity<Quiz> createQuiz(@PathVariable Long courseId, @RequestParam Long userId,
            @RequestBody Quiz quizData) {
        return createGlobalQuiz(userId, courseId, quizData);
    }

    @PostMapping("/generate")
    public ResponseEntity<Quiz> generateQuizFromBank(@RequestBody Map<String, Object> req) {
        Long userId = Long.valueOf(req.get("userId").toString());
        Long courseId = req.get("courseId") != null ? Long.valueOf(req.get("courseId").toString()) : null;
        String category = (String) req.get("category");
        int count = Integer.parseInt(req.get("count").toString());
        String title = (String) req.get("title");

        List<QuestionBankItem> bankItems = bankRepo.findByAuthorIdAndCategory(userId, category);
        Collections.shuffle(bankItems);
        List<QuestionBankItem> selectedItems = bankItems.stream().limit(Math.max(1, Math.min(count, bankItems.size())))
                .collect(Collectors.toList());

        Quiz quiz = new Quiz();
        quiz.setTitle(title);
        quiz.setDescription("Genererat quiz från kategori: " + category);

        User author = userRepository.findById(userId).orElseThrow();
        quiz.setAuthor(author);
        if (courseId != null)
            quiz.setCourse(courseRepository.findById(courseId).orElseThrow());

        List<Question> questions = new ArrayList<>();
        for (QuestionBankItem item : selectedItems) {
            Question q = new Question();
            q.setText(item.getQuestionText());
            q.setQuiz(quiz);

            List<Option> options = new ArrayList<>();
            for (int i = 0; i < item.getOptions().size(); i++) {
                Option o = new Option();
                String optionText = item.getOptions().get(i);
                o.setText(optionText);

                // Om correctAnswer matchar denna option text, sätt som korrekt
                // Eller om correctAnswer är ett index (legacy support), hantera det
                // Men nu kör vi String matchning enligt nya modellen
                boolean isCorrect = false;
                if (item.getCorrectAnswer() != null) {
                    isCorrect = item.getCorrectAnswer().equals(optionText);
                }
                o.setCorrect(isCorrect);

                o.setQuestion(q);
                options.add(o);
            }
            q.setOptions(options);
            questions.add(q);
        }
        quiz.setQuestions(questions);

        return ResponseEntity.ok(quizRepository.save(quiz));
    }

    @PostMapping("/{quizId}/submit")
    public ResponseEntity<QuizResult> submitResult(@PathVariable Long quizId,
            @RequestBody Map<String, Object> payload) {
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
            gamificationService.addPoints(studentId, score * 10);
        }

        if (score == maxScore && maxScore > 0) {
            gamificationService.addPoints(studentId, 50);
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

    @GetMapping("/results/student/{studentId}/course/{courseId}")
    public List<QuizResult> getCourseQuizResultsForStudent(@PathVariable Long studentId, @PathVariable Long courseId) {
        return resultRepository.findByStudentIdAndQuizCourseId(studentId, courseId);
    }
}