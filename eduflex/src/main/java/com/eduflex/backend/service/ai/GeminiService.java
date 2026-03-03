package com.eduflex.backend.service.ai;

import com.eduflex.backend.service.GdprDataMaskerService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.AiAuditService;
import com.eduflex.backend.service.AiCreditService;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Service for interacting with Google Gemini API.
 * Handles quiz question generation from document text.
 */
@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    @Autowired(required = false)
    @Qualifier("geminiRestTemplate")
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.eduflex.backend.service.SystemConfigService systemConfigService;

    @Autowired
    private AiCreditService aiCreditService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AiAuditService aiAuditService;

    @Autowired
    private GdprDataMaskerService gdprDataMaskerService;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String model;

    /**
     * Gets the current API key from database or environment.
     */
    private String getApiKey() {
        return systemConfigService.getGeminiApiKey();
    }

    // Prompts moved to eduflex-ai microservice

    /**
     * Generates a video script for an AI tutor lesson using Gemini.
     */
    public String generateVideoScript(String documentText) {
        validateAndSpendCredits(5, "AI Video Script Generation");
        logger.info("Generating video script from material length: {}", documentText.length());
        String actorId = SecurityContextHolder.getContext().getAuthentication().getName();

        String result = null;
        boolean success = false;
        String errorMsg = null;
        try {
            String url = aiServiceUrl + "/api/ai/script";
            String maskedText = gdprDataMaskerService.maskPii(documentText);
            Map<String, String> request = Map.of("text", maskedText);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            result = response.getBody();
            success = true;
            return result;
        } catch (Exception e) {
            errorMsg = e.getMessage();
            throw e;
        } finally {
            aiAuditService.logDecision("VIDEO_GENERATION", model, actorId,
                    "Video script from material (" + documentText.length() + " chars)", result,
                    null, success, errorMsg);
        }
    }

    /**
     * Generates a full course structure from document text using Gemini.
     */
    public String generateCourseStructure(String documentText) {
        validateAndSpendCredits(5, "AI Course Generation");
        logger.info("Generating course structure from document text length: {}", documentText.length());
        String actorId = SecurityContextHolder.getContext().getAuthentication().getName();

        String result = null;
        boolean success = false;
        String errorMsg = null;
        try {
            String url = aiServiceUrl + "/api/ai/course";
            String maskedText = gdprDataMaskerService.maskPii(documentText);
            Map<String, String> request = Map.of("text", maskedText);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            result = response.getBody();
            success = true;
            return result;
        } catch (Exception e) {
            errorMsg = e.getMessage();
            throw e;
        } finally {
            aiAuditService.logDecision("CONTENT_GENERATION", model, actorId,
                    "Course structure from document (" + documentText.length() + " chars)", result,
                    null, success, errorMsg);
        }
    }

    /**
     * Generates quiz questions from a specific topic/context.
     */
    public String generateQuizQuestionsFromTopic(String topic, int questionCount,
            int difficultyLevel, String language) {
        String difficulty = switch (difficultyLevel) {
            case 1, 2 -> "EASY";
            case 4, 5 -> "HARD";
            default -> "MEDIUM";
        };

        validateAndSpendCredits(questionCount, "AI Quiz Generation (" + topic + ")");
        String actorId = SecurityContextHolder.getContext().getAuthentication().getName();
        String result = null;
        boolean success = false;
        String errorMsg = null;
        try {
            String url = aiServiceUrl + "/api/ai/quiz";
            String maskedTopic = gdprDataMaskerService.maskPii(topic);
            Map<String, Object> request = Map.of(
                    "text", maskedTopic,
                    "count", questionCount,
                    "difficulty", difficulty,
                    "language", language);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            result = response.getBody();
            success = true;
            return result;
        } catch (Exception e) {
            errorMsg = e.getMessage();
            throw e;
        } finally {
            aiAuditService.logDecision("QUIZ_GENERATION", model, actorId,
                    "Topic: " + topic + ", count: " + questionCount + ", difficulty: " + difficultyLevel, result,
                    null, success, errorMsg);
        }
    }

    private String callGemini(String prompt) {
        return generateResponse(prompt);
    }

    /**
     * Generates quiz questions from document text using Gemini.
     */
    public String generateQuizQuestions(String documentText, int questionCount,
            String difficulty, String language) {
        validateAndSpendCredits(questionCount, "AI Quiz Generation");
        logger.info("Generating {} quiz questions at {} difficulty using Gemini via Microservice", questionCount,
                difficulty);
        questionCount = Math.max(1, Math.min(15, questionCount));
        String actorId = SecurityContextHolder.getContext().getAuthentication().getName();

        String result = null;
        boolean success = false;
        String errorMsg = null;
        try {
            String url = aiServiceUrl + "/api/ai/quiz";
            String maskedText = gdprDataMaskerService.maskPii(documentText);
            Map<String, Object> request = Map.of(
                    "text", maskedText,
                    "count", questionCount,
                    "difficulty", difficulty.toUpperCase(),
                    "language", language);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            result = response.getBody();
            success = true;
            return result;
        } catch (Exception e) {
            errorMsg = e.getMessage();
            throw e;
        } finally {
            aiAuditService.logDecision("QUIZ_GENERATION", model, actorId,
                    "Document quiz: " + questionCount + " questions, difficulty: " + difficulty, result,
                    null, success, errorMsg);
        }
    }

    /**
     * Generates a generic text response from Gemini (Chat mode).
     */
    public String generateResponse(String prompt) {
        return generateResponse(prompt, null);
    }

    /**
     * Generates a generic text response with explicit PII masking for names.
     */
    @SuppressWarnings("unchecked")
    public String generateResponse(String prompt, List<String> sensitiveNames) {
        validateAndSpendCredits(1, "AI Chat/Generic Response");
        String actorId = SecurityContextHolder.getContext().getAuthentication().getName();

        String result = null;
        boolean success = false;
        String errorMsg = null;
        try {
            String url = aiServiceUrl + "/api/ai/chat";

            // Mask PII using new Zero-Trust logic
            GdprDataMaskerService.MaskingResult maskingResult = gdprDataMaskerService.maskPii(prompt, sensitiveNames);
            String maskedPrompt = maskingResult.getMaskedText();

            Map<String, String> request = Map.of("prompt", maskedPrompt);
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, request,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);
            Map<String, Object> body = response.getBody();
            result = (String) body.get("text");

            // Restore names locally (Zero-Trust Restore)
            if (result != null && maskingResult.getNameMap() != null) {
                for (Map.Entry<String, String> entry : maskingResult.getNameMap().entrySet()) {
                    result = result.replace(entry.getKey(), entry.getValue());
                }
            }

            success = true;
            return result;
        } catch (Exception e) {
            logger.error("Failed to generate generic response via microservice", e);
            errorMsg = e.getMessage();
            result = "Tyvärr, jag kunde inte generera ett svar just nu.";
            return result;
        } finally {
            aiAuditService.logDecision("CHAT_INTERACTION", model, actorId,
                    prompt.length() > 500 ? prompt.substring(0, 500) + "..." : prompt,
                    result, null, success, errorMsg);
        }
    }

    /**
     * Generates content ensuring JSON output format.
     */
    public String generateJsonContent(String prompt) {
        return generateJsonContent(prompt, null);
    }

    /**
     * Generates JSON content with explicit PII masking for names.
     */
    @SuppressWarnings("unchecked")
    public String generateJsonContent(String prompt, List<String> sensitiveNames) {
        validateAndSpendCredits(1, "AI JSON Content Generation");
        String actorId = SecurityContextHolder.getContext().getAuthentication().getName();
        String result = null;
        boolean success = false;
        String errorMsg = null;
        try {
            String url = aiServiceUrl + "/api/ai/chat";

            // Mask PII
            GdprDataMaskerService.MaskingResult maskingResult = gdprDataMaskerService.maskPii(prompt, sensitiveNames);
            String maskedPrompt = maskingResult.getMaskedText();

            Map<String, String> request = Map.of("prompt", maskedPrompt);
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, request,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);
            Map<String, Object> body = response.getBody();
            result = (String) body.get("text");

            // Restore names
            if (result != null && maskingResult.getNameMap() != null) {
                for (Map.Entry<String, String> entry : maskingResult.getNameMap().entrySet()) {
                    result = result.replace(entry.getKey(), entry.getValue());
                }
            }

            success = true;
            return result;
        } catch (Exception e) {
            errorMsg = e.getMessage();
            throw e;
        } finally {
            aiAuditService.logDecision("CONTENT_GENERATION", model, actorId,
                    prompt.length() > 500 ? prompt.substring(0, 500) + "..." : prompt,
                    result, null, success, errorMsg);
        }
    }

    /**
     * Generates a vector embedding for the given text using Gemini.
     */
    @SuppressWarnings("unchecked")
    public List<Double> generateEmbedding(String text) {
        validateAndSpendCredits(0, "AI Embedding Generation");

        try {
            String url = aiServiceUrl + "/api/ai/embedding";
            Map<String, String> request = Map.of("text", text);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            if (body != null && body.containsKey("embedding")) {
                return (List<Double>) body.get("embedding");
            }
            throw new RuntimeException("Unexpected response format from AI service");
        } catch (Exception e) {
            logger.error("Failed to generate embedding via microservice", e);
            throw new RuntimeException("Failed to generate embedding: " + e.getMessage(), e);
        }
    }

    /**
     * Analyzes student performance using Gemini.
     */
    public String analyzeStudentPerformance(String performanceData) {
        validateAndSpendCredits(2, "AI Performance Analysis");
        String actorId = SecurityContextHolder.getContext().getAuthentication().getName();

        String result = null;
        boolean success = false;
        String errorMsg = null;
        try {
            String url = aiServiceUrl + "/api/ai/analyze";
            String maskedData = gdprDataMaskerService.maskPii(performanceData);
            Map<String, String> request = Map.of("text", maskedData);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            result = response.getBody();
            success = true;
            return result;
        } catch (Exception e) {
            errorMsg = e.getMessage();
            throw e;
        } finally {
            aiAuditService.logDecision("ADAPTIVE_ANALYSIS", model, actorId,
                    "Student performance data (" + performanceData.length() + " chars)", result,
                    null, success, errorMsg);
        }
    }

    /**
     * Generates a concise pedagogical insight for the teacher based on course
     * analytics.
     */
    public String generateControlCenterInsight(String prompt) {
        // Use general chat mode to get a natural language pedagogical conseil
        return generateResponse(prompt);
    }

    /**
     * Generates a detailed lesson plan based on course analytics insights.
     */
    public String generateLessonPlan(String prompt) {
        return generateResponse(prompt);
    }

    /**
     * Structurizes lesson text into slides for PowerPoint generation.
     */
    public JsonNode generateSlideContent(String lessonText) {
        validateAndSpendCredits(3, "AI PowerPoint Generation");
        logger.info("Generating slide content from material length: {}", lessonText.length());
        String actorId = SecurityContextHolder.getContext().getAuthentication().getName();

        String result = null;
        boolean success = false;
        String errorMsg = null;
        try {
            String url = aiServiceUrl + "/api/ai/ppt";
            String maskedText = gdprDataMaskerService.maskPii(lessonText);
            Map<String, String> request = Map.of("text", maskedText);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            result = response.getBody();

            if (result == null) {
                throw new RuntimeException("AI service returned empty response for PPT generation");
            }

            JsonNode node = objectMapper.readTree(result);
            success = true;
            return node;
        } catch (Exception e) {
            logger.error("Failed to generate slide content via microservice", e);
            errorMsg = e.getMessage();
            return null; // Let the caller (PowerPointService) handle the null check
        } finally {
            aiAuditService.logDecision("PPT_GENERATION", model, actorId,
                    "Slide structure from material (" + lessonText.length() + " chars)", result,
                    null, success, errorMsg);
        }
    }

    private String callGemini(String systemPrompt, String userPrompt, boolean jsonMode) {
        return generateResponse(systemPrompt + "\n\n" + userPrompt);
    }

    /**
     * Checks if the Gemini service is available and configured.
     */
    public boolean isAvailable() {
        return true; // Always available as it delegates to microservice
    }

    private void validateAndSpendCredits(int amount, String description) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null || username.equals("anonymousUser")) {
            // If system-level call without user context, we might want to bypass or check
            // tenant-wide.
            // For now, let's assume all AI features require a user context.
            logger.warn("AI generation attempted without user context for: {}", description);
            return;
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found for AI credit enforcement"));

        // 1. Check if tier allows AI
        aiCreditService.validateAiAccess(user);

        // 2. Spend credits
        if (amount > 0) {
            boolean success = aiCreditService.spendCredits(user, amount, description);
            if (!success) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.PAYMENT_REQUIRED,
                        "Du har inte tillräckligt med AI-poäng kvar. Uppgradera ditt konto!");
            }
        }
    }
}
