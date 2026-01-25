package com.eduflex.backend.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for interacting with OpenAI API.
 * Handles quiz question generation from document text.
 */
@Service
@ConditionalOnBean(OpenAiService.class)
public class OpenAIService {

    private static final Logger logger = LoggerFactory.getLogger(OpenAIService.class);

    private final OpenAiService openAiService;
    private final ObjectMapper objectMapper;

    @Value("${openai.model:gpt-4o}")
    private String model;

    @Value("${openai.max-tokens:4000}")
    private int maxTokens;

    @Value("${openai.temperature:0.7}")
    private double temperature;

    private static final String QUIZ_SYSTEM_PROMPT = """
        Du är en expert på att skapa pedagogiska quiz-frågor för utbildning.
        Generera flervalsfrågor baserat på den givna texten.

        REGLER:
        1. Alla frågor MÅSTE vara direkt baserade på innehållet i texten
        2. Varje fråga ska ha exakt 4 svarsalternativ
        3. Endast ETT alternativ ska vara korrekt
        4. Inkludera en kort förklaring till varför svaret är korrekt
        5. Variera svårighetsgraden enligt användarens önskemål
        6. Svara ALLTID på samma språk som källtexten
        7. Undvik ja/nej-frågor - skapa meningsfulla flervalsfrågor

        VIKTIGT: Returnera ENDAST giltig JSON utan markdown-formatering.
        Svara med följande JSON-struktur:
        {
          "questions": [
            {
              "text": "Frågetexten här",
              "options": ["Alternativ A", "Alternativ B", "Alternativ C", "Alternativ D"],
              "correctIndex": 0,
              "explanation": "Förklaring till varför detta svar är korrekt"
            }
          ]
        }
        """;

    @Autowired
    public OpenAIService(OpenAiService openAiService, ObjectMapper objectMapper) {
        this.openAiService = openAiService;
        this.objectMapper = objectMapper;
    }

    /**
     * Generates quiz questions from document text using OpenAI.
     *
     * @param documentText  The source text to generate questions from
     * @param questionCount Number of questions to generate (1-15)
     * @param difficulty    Difficulty level (EASY, MEDIUM, HARD)
     * @param language      Target language (sv, en, etc.)
     * @return JSON string containing generated questions
     */
    public String generateQuizQuestions(String documentText, int questionCount,
                                          String difficulty, String language) {
        logger.info("Generating {} quiz questions at {} difficulty", questionCount, difficulty);

        // Validate input
        questionCount = Math.max(1, Math.min(15, questionCount));

        String userPrompt = buildUserPrompt(documentText, questionCount, difficulty, language);

        ChatCompletionRequest request = ChatCompletionRequest.builder()
                .model(model)
                .messages(List.of(
                        new ChatMessage("system", QUIZ_SYSTEM_PROMPT),
                        new ChatMessage("user", userPrompt)
                ))
                .maxTokens(maxTokens)
                .temperature(temperature)
                .build();

        try {
            var response = openAiService.createChatCompletion(request);
            String content = response.getChoices().get(0).getMessage().getContent();

            logger.info("Received response from OpenAI ({} tokens used)",
                    response.getUsage().getTotalTokens());

            // Clean the response (remove markdown code blocks if present)
            content = cleanJsonResponse(content);

            // Validate JSON
            validateJsonResponse(content);

            return content;

        } catch (Exception e) {
            logger.error("Failed to generate quiz questions", e);
            throw new RuntimeException("Failed to generate quiz questions: " + e.getMessage(), e);
        }
    }

    /**
     * Builds the user prompt for quiz generation.
     */
    private String buildUserPrompt(String documentText, int questionCount,
                                    String difficulty, String language) {
        String difficultyDescription = switch (difficulty.toUpperCase()) {
            case "EASY" -> "enkla (grundläggande förståelse, direkt från texten)";
            case "HARD" -> "svåra (kräver analys och djupare förståelse)";
            default -> "medel (blandning av direkt förståelse och viss analys)";
        };

        String languageInstruction = "sv".equalsIgnoreCase(language)
                ? "Skriv alla frågor och svar på svenska."
                : "Write all questions and answers in the same language as the source text.";

        return String.format("""
            Generera exakt %d quiz-frågor baserat på följande text.

            Svårighetsgrad: %s
            %s

            KÄLLTEXT:
            ---
            %s
            ---

            Kom ihåg: Returnera ENDAST giltig JSON utan markdown-formatering.
            """, questionCount, difficultyDescription, languageInstruction, documentText);
    }

    /**
     * Cleans the JSON response by removing markdown code blocks.
     */
    private String cleanJsonResponse(String response) {
        if (response == null) {
            return "{}";
        }

        // Remove markdown code blocks
        response = response.trim();
        if (response.startsWith("```json")) {
            response = response.substring(7);
        } else if (response.startsWith("```")) {
            response = response.substring(3);
        }
        if (response.endsWith("```")) {
            response = response.substring(0, response.length() - 3);
        }

        return response.trim();
    }

    /**
     * Validates that the response is valid JSON with expected structure.
     */
    private void validateJsonResponse(String json) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(json);

        if (!root.has("questions")) {
            throw new IllegalStateException("Response missing 'questions' field");
        }

        JsonNode questions = root.get("questions");
        if (!questions.isArray() || questions.isEmpty()) {
            throw new IllegalStateException("'questions' must be a non-empty array");
        }

        // Validate first question structure
        JsonNode firstQuestion = questions.get(0);
        if (!firstQuestion.has("text") || !firstQuestion.has("options") ||
            !firstQuestion.has("correctIndex") || !firstQuestion.has("explanation")) {
            throw new IllegalStateException("Question missing required fields");
        }
    }

    /**
     * Checks if the OpenAI service is available and configured.
     */
    public boolean isAvailable() {
        return openAiService != null;
    }
}
