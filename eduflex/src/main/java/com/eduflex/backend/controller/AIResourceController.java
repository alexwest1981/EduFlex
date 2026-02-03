package com.eduflex.backend.controller;

import com.eduflex.backend.model.Assignment;
import com.eduflex.backend.model.Lesson;
import com.eduflex.backend.model.Quiz;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.AssignmentRepository;
import com.eduflex.backend.repository.LessonRepository;
import com.eduflex.backend.repository.QuizRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai/resources")
@CrossOrigin(origins = "*")
public class AIResourceController {

    private final AIService aiService;
    private final UserRepository userRepo;
    private final QuizRepository quizRepo;
    private final LessonRepository lessonRepo;
    private final AssignmentRepository assignmentRepo;

    public AIResourceController(
            AIService aiService,
            UserRepository userRepo,
            QuizRepository quizRepo,
            LessonRepository lessonRepo,
            AssignmentRepository assignmentRepo) {
        this.aiService = aiService;
        this.userRepo = userRepo;
        this.quizRepo = quizRepo;
        this.lessonRepo = lessonRepo;
        this.assignmentRepo = assignmentRepo;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateResource(
            @RequestParam Long userId,
            @RequestParam String type,
            @RequestParam String prompt,
            @RequestParam(required = false) String context) {

        User author = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            // Generera resursen med AI
            String aiResponse = aiService.generateResource(type, prompt, context);

            // Spara resursen baserat på typ
            Object savedResource = switch (type.toUpperCase()) {
                case "QUIZ" -> {
                    Quiz quiz = parseQuizFromAI(aiResponse, author);
                    yield quizRepo.save(quiz);
                }
                case "LESSON" -> {
                    Lesson lesson = parseLessonFromAI(aiResponse, author);
                    yield lessonRepo.save(lesson);
                }
                case "TASK", "ASSIGNMENT" -> {
                    Assignment assignment = parseAssignmentFromAI(aiResponse, author);
                    yield assignmentRepo.save(assignment);
                }
                default -> throw new IllegalArgumentException("Unknown resource type: " + type);
            };

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "resource", savedResource,
                    "message", "Resource created successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    private Quiz parseQuizFromAI(String aiResponse, User author) {
        // TODO: Implementera parsing av AI-svar till Quiz
        Quiz quiz = new Quiz();
        quiz.setTitle("AI-genererat Quiz");
        quiz.setAuthor(author);
        return quiz;
    }

    private Lesson parseLessonFromAI(String aiResponse, User author) {
        // Parse AI response to create lesson
        Lesson lesson = new Lesson();

        // Extrahera titel från AI-svaret (första raden eller default)
        String[] lines = aiResponse.split("\n", 2);
        String title = lines.length > 0 && !lines[0].trim().isEmpty()
                ? lines[0].trim().replaceAll("^#+\\s*", "") // Ta bort markdown headers
                : "AI-genererad Lektion";

        String content = lines.length > 1 ? lines[1].trim() : aiResponse;

        lesson.setTitle(title);
        lesson.setContent(content);
        lesson.setAuthor(author);
        lesson.setCourse(null); // Global lektion
        lesson.setSortOrder(0);

        return lesson;
    }

    private Assignment parseAssignmentFromAI(String aiResponse, User author) {
        // TODO: Implementera parsing av AI-svar till Assignment
        Assignment assignment = new Assignment();
        assignment.setTitle("AI-genererad Uppgift");
        assignment.setDescription(aiResponse);
        assignment.setAuthor(author);
        return assignment;
    }
}
