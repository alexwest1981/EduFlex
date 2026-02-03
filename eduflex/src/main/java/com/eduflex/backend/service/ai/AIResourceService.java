package com.eduflex.backend.service.ai;

import com.eduflex.backend.model.Resource;
import com.eduflex.backend.service.ResourceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AIResourceService {

    private static final Logger logger = LoggerFactory.getLogger(AIResourceService.class);

    private final GeminiService geminiService;
    private final ResourceService resourceService;
    private final ObjectMapper objectMapper;

    public AIResourceService(GeminiService geminiService, ResourceService resourceService, ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.resourceService = resourceService;
        this.objectMapper = objectMapper;
    }

    private static final String RESOURCE_SYSTEM_PROMPT = """
            Du är en pedagogisk expert för EduFlex LMS. Din uppgift är att generera högkvalitativa utbildningsresurser.

            TYPER:
            - QUIZ: Ett set med frågor, alternativ och rätta svar.
            - TASK: En inlämningsuppgift med instruktioner och betygskriterier.
            - LESSON: En lektionsplanering med mål, genomgång och aktiviteter.

            VIKTIGT:
            Svara ENDAST med giltig JSON. Ingen markdown-formatering.

            FORMAT FÖR QUIZ:
            {
              "name": "Quiz-titel",
              "description": "Kort beskrivning",
              "type": "QUIZ",
              "content": {
                "questions": [
                  { "text": "Fråga?", "options": ["A", "B", "C"], "answer": "B" }
                ]
              }
            }

            FORMAT FÖR TASK (Uppgift):
            {
              "name": "Uppgifts-titel",
              "description": "Övergripande beskrivning",
              "type": "TASK",
              "content": {
                "instructions": "Detaljerade steg...",
                "criteria": ["Kriterie 1", "Kriterie 2"],
                "submissionType": "FILE"
              }
            }

            FORMAT FÖR LESSON:
            {
              "name": "Lektions-titel",
              "description": "Syfte",
              "type": "LESSON",
              "content": {
                "outline": [
                  { "title": "Introduktion", "content": "Säg hej..." },
                  { "title": "Genomgång", "content": "Förklara X..." }
                ],
                "duration": "60 min"
              }
            }
            """;

    public Resource generateResource(Long userId, String type, String prompt, String context) {
        String fullPrompt = RESOURCE_SYSTEM_PROMPT + "\n\nUPPGIFT:\nSkapa en " + type + " baserat på följande:\n"
                + prompt;
        if (context != null && !context.isEmpty()) {
            fullPrompt += "\n\nEXTRA KONTEXT:\n" + context;
        }

        try {
            String jsonResponse = geminiService.generateResponse(fullPrompt);
            jsonResponse = cleanJson(jsonResponse);

            Map<String, Object> data = objectMapper.readValue(jsonResponse, Map.class);

            Resource resource = new Resource();
            resource.setName((String) data.get("name"));
            resource.setDescription((String) data.get("description"));
            resource.setType(Resource.ResourceType.valueOf(((String) data.get("type")).toUpperCase()));

            // Convert the content map back to JSON string for storage
            String contentJson = objectMapper.writeValueAsString(data.get("content"));
            resource.setContent(contentJson);

            return resourceService.createResource(userId, resource);

        } catch (Exception e) {
            logger.error("Failed to generate AI resource", e);
            throw new RuntimeException("Could not generate resource: " + e.getMessage());
        }
    }

    private String cleanJson(String response) {
        if (response == null)
            return "{}";
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
}
