package com.eduflex.backend.service.ai;

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

/**
 * Service for interacting with Google Gemini API.
 * Handles quiz question generation from document text.
 */
@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    @Autowired(required = false)
    @Qualifier("geminiRestTemplate")
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.eduflex.backend.service.SystemConfigService systemConfigService;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String model;

    /**
     * Gets the current API key from database or environment.
     */
    private String getApiKey() {
        return systemConfigService.getGeminiApiKey();
    }

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

    private static final String COURSE_SYSTEM_PROMPT = """
            Du är en expert på instruktionsdesign och läroplansutveckling.
            Din uppgift är att skapa en strukturerad onlinekurs baserat på det givna materialet.

            Skapa en kursstruktur med Moduler och Lektioner.
            För varje lektion, skriv en kort sammanfattning av innehållet.
            Inkludera även förslag på quiz-frågor för vissa lektioner.

            FORMAT:
            Du MÅSTE svara med giltig JSON som följer denna struktur:
            {
              "title": "Kurstitel",
              "description": "Kort kursbeskrivning",
              "startDate": "YYYY-MM-DD",
              "endDate": "YYYY-MM-DD",
              "modules": [
                {
                  "title": "Modul 1: Introduktion",
                  "lessons": [
                    {
                      "title": "Lektion 1.1",
                      "content": "Sammanfattning av lektionen...",
                      "isQuiz": false
                    },
                    {
                      "title": "Quiz 1",
                      "isQuiz": true,
                      "questions": [
                        {
                          "text": "Fråga?",
                          "options": ["A", "B", "C", "D"],
                          "correctIndex": 0,
                          "explanation": "Förklaring..."
                        }
                      ]
                    }
                  ]
                }
              ]
            }

            Regler:
            1. Strukturera materialet logiskt.
            2. Varje modul ska ha 2-5 lektioner.
            3. Avsluta varje modul med ett quiz om möjligt.
            4. Försök hitta start- och slutdatum för kursen i texten. Om du hittar dem, använd formatet YYYY-MM-DD. Om de saknas helt, lämna fälten tomma ("").
            5. Svara på SAMMA SPRÅK som källtexten.
            """;

    /**
     * Generates a full course structure from document text using Gemini.
     */
    public String generateCourseStructure(String documentText) {
        logger.info("Generating course structure from document text length: {}", documentText.length());

        // Truncate if too long (approx 30k chars to stay within token limits for Flash
        // model)
        // Gemini 1.5/2.0 handle huge context, but let's be safe or just pass it all if
        // using 1.5 Pro/Flash.
        // The default model is gemini-2.0-flash which has 1M context, so passing full
        // text is fine usually.
        // But let's check config.

        String prompt = COURSE_SYSTEM_PROMPT + "\n\nKÄLLTEXT:\n---\n" + documentText + "\n---\n";
        return callGemini(prompt);
    }

    /**
     * Generates quiz questions from a specific topic/context.
     */
    public String generateQuizQuestionsFromTopic(String topic, int questionCount,
            int difficultyLevel, String language) {
        // Map numeric difficulty (1-5) to description
        String difficultyDesc = switch (difficultyLevel) {
            case 1 -> "mycket grundläggande (nybörjare, faktafrågor)";
            case 2 -> "enkla (förståelse)";
            case 3 -> "medel (blandning av fakta och analys)";
            case 4 -> "svåra (djupare analys, tillämpning)";
            case 5 -> "mycket svåra (komplex problemlösning, syntes)";
            default -> "medel";
        };

        String fullPrompt = QUIZ_SYSTEM_PROMPT + "\n\n"
                + buildTopicUserPrompt(topic, questionCount, difficultyDesc, language);

        return callGemini(fullPrompt, true);
    }

    private String buildTopicUserPrompt(String topic, int questionCount, String difficultyDesc, String language) {
        String languageInstruction = "sv".equalsIgnoreCase(language)
                ? "Skriv alla frågor och svar på svenska."
                : "Write all questions and answers in " + language;

        return String.format("""
                Generera exakt %d quiz-frågor inom ämnet/kontexten: "%s".

                Svårighetsgrad: %s
                %s

                Frågorna ska vara relevanta för en kurs inom detta ämne.

                Kom ihåg: Returnera ENDAST giltig JSON utan markdown-formatering.
                """, questionCount, topic, difficultyDesc, languageInstruction);
    }

    private String callGemini(String prompt) {
        return callGemini(prompt, false);
    }

    private String callGemini(String prompt, boolean validateQuiz) {
        // Build request body for Gemini API
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)))),
                "generationConfig", Map.of(
                        "temperature", 0.7,
                        "maxOutputTokens", 4000,
                        "responseMimeType", "application/json"));

        try {
            String url = String.format(GEMINI_API_URL, model, getApiKey());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            long startTime = System.currentTimeMillis();
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            long elapsed = System.currentTimeMillis() - startTime;
            logger.info("Received response from Gemini in {}ms", elapsed);

            String content = extractContentFromResponse(response.getBody());
            content = cleanJsonResponse(content);

            if (validateQuiz) {
                validateJsonResponse(content);
            }

            return content;
        } catch (Exception e) {
            logger.error("Failed to call Gemini", e);
            throw new RuntimeException("Gemini call failed: " + e.getMessage(), e);
        }
    }

    /**
     * Extracts the text content from the Gemini API response.
     */
    private String extractContentFromResponse(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode candidates = root.get("candidates");
            if (candidates != null && candidates.isArray() && !candidates.isEmpty()) {
                JsonNode content = candidates.get(0).get("content");
                if (content != null) {
                    JsonNode parts = content.get("parts");
                    if (parts != null && parts.isArray() && !parts.isEmpty()) {
                        return parts.get(0).get("text").asText();
                    }
                }
            }
            return "";
        } catch (Exception e) {
            logger.error("Failed to extract content from Gemini response", e);
            return "";
        }
    }

    /**
     * Generates quiz questions from document text using Gemini.
     */
    public String generateQuizQuestions(String documentText, int questionCount,
            String difficulty, String language) {
        logger.info("Generating {} quiz questions at {} difficulty using Gemini", questionCount, difficulty);
        questionCount = Math.max(1, Math.min(15, questionCount));
        String fullPrompt = QUIZ_SYSTEM_PROMPT + "\n\n"
                + buildUserPrompt(documentText, questionCount, difficulty, language);
        return callGemini(fullPrompt, true);
    }

    /**
     * Generates a generic text response from Gemini (Chat mode).
     */
    public String generateResponse(String prompt) {
        // Simple chat generation without JSON constraints
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)))));
        // No responseMimeType: application/json here

        try {
            String url = String.format(GEMINI_API_URL, model, getApiKey());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            return extractContentFromResponse(response.getBody());
        } catch (Exception e) {
            logger.error("Failed to generate generic response", e);
            return "Tyvärr, jag kunde inte generera ett svar just nu.";
        }
    }

    /**
     * Generates content ensuring JSON output format.
     */
    public String generateJsonContent(String prompt) {
        return callGemini(prompt, false);
    }

    /**
     * Builds the user prompt for document-based quiz generation.
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

    private static final String GEMINI_EMBEDDING_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=%s";

    /**
     * Generates a vector embedding for the given text using Gemini.
     */
    public List<Double> generateEmbedding(String text) {
        if (!isAvailable()) {
            throw new IllegalStateException("Gemini API is not configured");
        }

        // Prepare request body
        Map<String, Object> requestBody = Map.of(
                "model", "models/gemini-embedding-001",
                "content", Map.of(
                        "parts", List.of(
                                Map.of("text", text))));

        try {
            String url = String.format(GEMINI_EMBEDDING_API_URL, getApiKey());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            long startTime = System.currentTimeMillis();
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            long elapsed = System.currentTimeMillis() - startTime;
            logger.info("Generated embedding in {}ms", elapsed);

            return extractEmbeddingFromResponse(response.getBody());
        } catch (Exception e) {
            logger.error("Failed to generate embedding with Gemini", e);
            throw new RuntimeException("Failed to generate embedding: " + e.getMessage(), e);
        }
    }

    private List<Double> extractEmbeddingFromResponse(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode embedding = root.path("embedding").path("values");
            if (embedding.isArray()) {
                return objectMapper.convertValue(embedding, List.class);
            }
            throw new IllegalStateException("Invalid embedding response format");
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse embedding response", e);
        }
    }

    private static final String ANALYSIS_SYSTEM_PROMPT = """
            Du är en expert på pedagogisk analys och adaptivt lärande.
            Din uppgift är att analysera en students prestationer och ge konstruktiv feedback.

            Indata: En lista med kursresultat, betyg och inlämningshistorik.

            Analysera följande:
            1. Identifiera studentens styrkor (ämnen/metoder där de presterar bra).
            2. Identifiera svagheter eller "struggle areas".
            3. Föreslå konkreta åtgärder (rekommendationer).
            4. Bedöm studietakt/pace (långsam, balanserad, snabb).

            FORMAT:
            Du MÅSTE svara med giltig JSON:
            {
              "analysisSummary": "En sammanfattande text riktad till studenten (du-tilltal).",
              "struggleAreas": ["Område 1", "Område 2"],
              "strengthAreas": ["Styrka 1", "Styrka 2"],
              "paceEvaluation": "SLOW" | "BALANCED" | "FAST",
              "recommendations": [
                {
                  "title": "Titel på åtgärd",
                  "description": "Beskrivning...",
                  "type": "REVIEW_TOPIC" | "CHALLENGE_YOURSELF" | "PRACTICE_QUIZ",
                  "reasoning": "Varför denna rekommendation?"
                }
              ]
            }
            """;

    /**
     * Analyzes student performance using Gemini.
     */
    public String analyzeStudentPerformance(String performanceData) {
        String prompt = ANALYSIS_SYSTEM_PROMPT + "\n\nSTUDENTDATA:\n---\n" + performanceData + "\n---\n";
        return callGemini(prompt, false); // Validate JSON manually in calling service if needed, or add validation here
    }

    /**
     * Checks if the Gemini service is available and configured.
     */
    public boolean isAvailable() {
        String key = getApiKey();
        return key != null && !key.isBlank() && restTemplate != null;
    }
}
