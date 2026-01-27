package com.eduflex.backend.controller;

import com.eduflex.backend.dto.ai.AIQuizGenerationRequest;
import com.eduflex.backend.dto.ai.AIQuizGenerationResponse;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.Quiz;
import com.eduflex.backend.model.SystemModule;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.ModuleRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.SystemConfigService;
import com.eduflex.backend.service.ai.AIQuizGeneratorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * REST Controller for AI-powered quiz generation.
 * Allows teachers to generate quiz questions from uploaded documents using
 * OpenAI.
 */
@RestController
@RequestMapping("/api/ai/quiz")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Tag(name = "AI Quiz", description = "AI-powered quiz generation from documents")
@ConditionalOnBean(AIQuizGeneratorService.class)
public class AIQuizController {

    private static final Logger logger = LoggerFactory.getLogger(AIQuizController.class);
    private static final String MODULE_KEY = "AI_QUIZ";

    private final AIQuizGeneratorService aiQuizGeneratorService;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;
    private final SystemConfigService systemConfigService;

    @Autowired
    public AIQuizController(AIQuizGeneratorService aiQuizGeneratorService,
            UserRepository userRepository,
            CourseRepository courseRepository,
            ModuleRepository moduleRepository,
            SystemConfigService systemConfigService) {
        this.aiQuizGeneratorService = aiQuizGeneratorService;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.moduleRepository = moduleRepository;
        this.systemConfigService = systemConfigService;
    }

    /**
     * Checks if the AI_QUIZ module is enabled.
     */
    private boolean isModuleEnabled() {
        return moduleRepository.findByModuleKey(MODULE_KEY)
                .map(SystemModule::isActive)
                .orElse(false);
    }

    /**
     * Generate quiz questions from an uploaded document (PDF, DOCX, etc.)
     */
    @PostMapping(value = "/generate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Generate quiz from document", description = "Upload a PDF/DOCX file and generate quiz questions using AI")
    public ResponseEntity<AIQuizGenerationResponse> generateFromFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "questionCount", defaultValue = "5") int questionCount,
            @RequestParam(value = "difficulty", defaultValue = "MEDIUM") String difficulty,
            @RequestParam(value = "language", defaultValue = "sv") String language,
            @RequestParam(value = "title", required = false) String title) {

        logger.info("AI quiz generation request: file={}, questions={}, difficulty={}",
                file.getOriginalFilename(), questionCount, difficulty);

        // Check if module is enabled
        if (!isModuleEnabled()) {
            return ResponseEntity.status(403).body(
                    AIQuizGenerationResponse.builder()
                            .success(false)
                            .errorMessage("AI Quiz-modulen är inte aktiverad. Kontakta administratören.")
                            .build());
        }

        try {
            AIQuizGenerationRequest request = new AIQuizGenerationRequest();
            request.setQuestionCount(questionCount);
            request.setDifficulty(difficulty);
            request.setLanguage(language);
            request.setTitle(title);

            AIQuizGenerationResponse response = aiQuizGeneratorService.generateFromFile(file, request);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    AIQuizGenerationResponse.builder()
                            .success(false)
                            .errorMessage(e.getMessage())
                            .build());
        } catch (Exception e) {
            logger.error("Failed to generate quiz", e);
            return ResponseEntity.internalServerError().body(
                    AIQuizGenerationResponse.builder()
                            .success(false)
                            .errorMessage("Ett fel uppstod vid quiz-generering: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Generate quiz from plain text content.
     */
    @PostMapping("/generate-from-text")
    @Operation(summary = "Generate quiz from text", description = "Generate quiz questions from plain text using AI")
    public ResponseEntity<AIQuizGenerationResponse> generateFromText(
            @RequestBody Map<String, Object> payload) {

        String textContent = (String) payload.get("text");
        int questionCount = payload.containsKey("questionCount")
                ? Integer.parseInt(payload.get("questionCount").toString())
                : 5;
        String difficulty = (String) payload.getOrDefault("difficulty", "MEDIUM");
        String language = (String) payload.getOrDefault("language", "sv");
        String title = (String) payload.get("title");

        logger.info("AI quiz generation from text: {} chars, {} questions",
                textContent != null ? textContent.length() : 0, questionCount);

        // Check if module is enabled
        if (!isModuleEnabled()) {
            return ResponseEntity.status(403).body(
                    AIQuizGenerationResponse.builder()
                            .success(false)
                            .errorMessage("AI Quiz-modulen är inte aktiverad. Kontakta administratören.")
                            .build());
        }

        try {
            AIQuizGenerationRequest request = new AIQuizGenerationRequest();
            request.setQuestionCount(questionCount);
            request.setDifficulty(difficulty);
            request.setLanguage(language);
            request.setTitle(title);

            AIQuizGenerationResponse response = aiQuizGeneratorService.generateFromText(textContent, request);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    AIQuizGenerationResponse.builder()
                            .success(false)
                            .errorMessage(e.getMessage())
                            .build());
        } catch (Exception e) {
            logger.error("Failed to generate quiz from text", e);
            return ResponseEntity.internalServerError().body(
                    AIQuizGenerationResponse.builder()
                            .success(false)
                            .errorMessage("Ett fel uppstod: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Save a generated quiz to the database.
     */
    @PostMapping("/save")
    @Operation(summary = "Save generated quiz", description = "Save AI-generated questions as a quiz")
    public ResponseEntity<Map<String, Object>> saveGeneratedQuiz(
            @RequestBody Map<String, Object> payload) {

        Long userId = Long.valueOf(payload.get("userId").toString());
        Long courseId = payload.get("courseId") != null
                ? Long.valueOf(payload.get("courseId").toString())
                : null;
        boolean addToBank = payload.containsKey("addToQuestionBank")
                ? (Boolean) payload.get("addToQuestionBank")
                : true;

        // Parse the generated response from the payload
        @SuppressWarnings("unchecked")
        Map<String, Object> generatedData = (Map<String, Object>) payload.get("generatedQuiz");

        try {
            User author = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            Course course = null;
            if (courseId != null) {
                course = courseRepository.findById(courseId)
                        .orElseThrow(() -> new IllegalArgumentException("Course not found"));
            }

            // Reconstruct the response from the payload
            AIQuizGenerationResponse response = reconstructResponse(generatedData);

            Quiz savedQuiz = aiQuizGeneratorService.saveAsQuiz(response, author, course, addToBank);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "quizId", savedQuiz.getId(),
                    "message", "Quiz sparades framgångsrikt"));

        } catch (Exception e) {
            logger.error("Failed to save quiz", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    /**
     * Check if AI quiz generation is available.
     */
    @GetMapping("/status")
    @Operation(summary = "Check AI status", description = "Check if AI quiz generation is available and configured")
    public ResponseEntity<Map<String, Object>> getStatus() {
        boolean moduleEnabled = isModuleEnabled();
        boolean apiConfigured = aiQuizGeneratorService.isAvailable();
        boolean available = moduleEnabled && apiConfigured;

        String message;
        if (!moduleEnabled) {
            message = "AI Quiz-modulen är inte aktiverad. Aktivera den under Systemmoduler.";
        } else if (!apiConfigured) {
            message = "API-nyckel saknas. Konfigurera Gemini API-nyckel nedan.";
        } else {
            message = "AI quiz-generering är tillgänglig";
        }

        // Get masked API key for display
        String maskedKey = systemConfigService.getMaskedValue(SystemConfigService.GEMINI_API_KEY);
        boolean keyInDatabase = systemConfigService.isStoredInDatabase(SystemConfigService.GEMINI_API_KEY);

        return ResponseEntity.ok(Map.of(
                "available", available,
                "moduleEnabled", moduleEnabled,
                "apiConfigured", apiConfigured,
                "message", message,
                "maskedApiKey", maskedKey != null ? maskedKey : "",
                "keySource", keyInDatabase ? "database" : (apiConfigured ? "environment" : "none")));
    }

    /**
     * Save the Gemini API key.
     */
    @PostMapping("/config/api-key")
    @Operation(summary = "Save API key", description = "Save or update the Gemini API key for AI quiz generation")
    public ResponseEntity<Map<String, Object>> saveApiKey(@RequestBody Map<String, String> payload) {
        String apiKey = payload.get("apiKey");

        if (apiKey == null || apiKey.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "API-nyckel kan inte vara tom"));
        }

        // Basic validation - Gemini API keys typically start with "AIza"
        if (!apiKey.startsWith("AIza")) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Ogiltig API-nyckel. Gemini API-nycklar börjar med 'AIza'"));
        }

        try {
            systemConfigService.setValue(
                    SystemConfigService.GEMINI_API_KEY,
                    apiKey,
                    "Google Gemini API key for AI Quiz generation",
                    true,
                    "admin");

            logger.info("Gemini API key updated successfully");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "API-nyckel sparad",
                    "maskedKey", "****" + apiKey.substring(apiKey.length() - 4)));
        } catch (Exception e) {
            logger.error("Failed to save API key", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Kunde inte spara API-nyckel: " + e.getMessage()));
        }
    }

    /**
     * Delete the stored API key (revert to environment variable).
     */
    @DeleteMapping("/config/api-key")
    @Operation(summary = "Delete API key", description = "Remove the stored API key (will fall back to environment variable)")
    public ResponseEntity<Map<String, Object>> deleteApiKey() {
        try {
            systemConfigService.setValue(
                    SystemConfigService.GEMINI_API_KEY,
                    "",
                    "Google Gemini API key for AI Quiz generation",
                    true,
                    "admin");

            logger.info("Gemini API key removed from database");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "API-nyckel borttagen. Systemet använder nu miljövariabeln om den finns."));
        } catch (Exception e) {
            logger.error("Failed to delete API key", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Kunde inte ta bort API-nyckel: " + e.getMessage()));
        }
    }

    /**
     * Generate a practice quiz for a student (based on course context).
     */
    @PostMapping("/practice/generate")
    @Operation(summary = "Generate practice quiz", description = "Generate a practice quiz for a student based on a course context")
    public ResponseEntity<AIQuizGenerationResponse> generatePracticeQuiz(
            @RequestBody Map<String, Object> payload) {

        Long courseId = Long.valueOf(payload.get("courseId").toString());
        int questionCount = payload.containsKey("questionCount")
                ? Integer.parseInt(payload.get("questionCount").toString())
                : 5;
        // Difficulty 1-5
        int difficulty = payload.containsKey("difficulty")
                ? Integer.parseInt(payload.get("difficulty").toString())
                : 3;

        // Check availability
        if (!isModuleEnabled()) {
            return ResponseEntity.status(403).body(
                    AIQuizGenerationResponse.builder()
                            .success(false)
                            .errorMessage("AI Quiz-modulen är inte aktiverad.")
                            .build());
        }

        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("Course not found"));

            AIQuizGenerationResponse response = aiQuizGeneratorService.generatePracticeQuiz(course, difficulty,
                    questionCount);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    AIQuizGenerationResponse.builder()
                            .success(false)
                            .errorMessage(e.getMessage())
                            .build());
        } catch (Exception e) {
            logger.error("Failed to generate practice quiz", e);
            return ResponseEntity.internalServerError().body(
                    AIQuizGenerationResponse.builder()
                            .success(false)
                            .errorMessage("Ett fel uppstod: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Log completion of a practice quiz.
     */
    @PostMapping("/practice/complete")
    @Operation(summary = "Log practice quiz", description = "Log result of an ephemeral practice quiz")
    public ResponseEntity<Void> completePracticeQuiz(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            Long courseId = Long.valueOf(payload.get("courseId").toString());
            int score = Integer.parseInt(payload.get("score").toString());
            int maxScore = Integer.parseInt(payload.get("maxScore").toString());
            int difficulty = payload.containsKey("difficulty")
                    ? Integer.parseInt(payload.get("difficulty").toString())
                    : 3;

            User student = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("Course not found"));

            aiQuizGeneratorService.logPracticeQuizCompletion(student, course, score, maxScore, difficulty);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Failed to log practice quiz", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Reconstructs AIQuizGenerationResponse from a map (for save operation).
     */
    @SuppressWarnings("unchecked")
    private AIQuizGenerationResponse reconstructResponse(Map<String, Object> data) {
        AIQuizGenerationResponse.Builder builder = AIQuizGenerationResponse.builder()
                .success(true)
                .title((String) data.get("title"));

        if (data.containsKey("questions")) {
            java.util.List<com.eduflex.backend.dto.ai.GeneratedQuestionDTO> questions = new java.util.ArrayList<>();
            java.util.List<Map<String, Object>> questionList = (java.util.List<Map<String, Object>>) data
                    .get("questions");

            for (Map<String, Object> qData : questionList) {
                com.eduflex.backend.dto.ai.GeneratedQuestionDTO dto = new com.eduflex.backend.dto.ai.GeneratedQuestionDTO();
                dto.setText((String) qData.get("text"));
                dto.setOptions((java.util.List<String>) qData.get("options"));
                dto.setCorrectIndex(((Number) qData.get("correctIndex")).intValue());
                dto.setExplanation((String) qData.get("explanation"));
                questions.add(dto);
            }
            builder.questions(questions);
        }

        return builder.build();
    }
}
