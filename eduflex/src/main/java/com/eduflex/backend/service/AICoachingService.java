package com.eduflex.backend.service;

import com.eduflex.backend.model.StudentRiskFlag;
import com.eduflex.backend.repository.StudentRiskFlagRepository;
import com.eduflex.backend.service.ai.GeminiService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AICoachingService {

    private static final Logger logger = LoggerFactory.getLogger(AICoachingService.class);

    private final StudentRiskFlagRepository riskFlagRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public AICoachingService(StudentRiskFlagRepository riskFlagRepository,
            GeminiService geminiService,
            ObjectMapper objectMapper) {
        this.riskFlagRepository = riskFlagRepository;
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> getPrincipalWeeklyFocus() {
        List<StudentRiskFlag> allHighRisks = riskFlagRepository.findHighRiskFlags();

        // aggregate stats for Gemini
        Map<String, Long> categoryCounts = allHighRisks.stream()
                .collect(Collectors.groupingBy(StudentRiskFlag::getCategory, Collectors.counting()));

        Map<String, Object> promptData = new HashMap<>();
        promptData.put("highRiskCount", allHighRisks.size());
        promptData.put("categories", categoryCounts);

        String prompt = "Du är en AI-coach för en rektor. Här är nuläget på skolan gällande elever i riskzonen:\n" +
                promptData.toString() + "\n\n" +
                "Ge en kort sammanfattning (max 3 meningar) om var rektorn bör lägga sitt fokus denna vecka. " +
                "Svara på svenska. Svara i JSON format: {\"summary\": \"...\", \"priorityArea\": \"...\", \"actionPoint\": \"...\"}";

        try {
            String jsonResponse = geminiService.generateJsonContent(prompt);
            return objectMapper.readValue(jsonResponse, new TypeReference<>() {
            });
        } catch (Exception e) {
            logger.error("Failed to generate Principal weekly focus: {}", e.getMessage());
            return Map.of("summary", "Kunde inte generera insikt just nu.", "priorityArea", "Allmänt", "actionPoint",
                    "Granska risklistan manuellt.");
        }
    }

    public Map<String, Object> getMentorStudentOverview(Long mentorId) {
        List<StudentRiskFlag> mentorRisks = riskFlagRepository.findHighRiskFlagsForMentor(mentorId);

        Map<String, Object> promptData = new HashMap<>();
        promptData.put("studentRisks", mentorRisks.stream().map(r -> Map.of(
                "name", r.getStudent().getFullName(),
                "level", r.getRiskLevel(),
                "reason", r.getAiReasoning())).collect(Collectors.toList()));

        String prompt = "Du är en AI-coach för en mentor. Här är dina elever som är flaggade som högrisk:\n" +
                promptData.toString() + "\n\n" +
                "Skapa ett underlag för veckans mentortid. Vad är den viktigaste gemensamma nämnaren och vad bör prioriteras i samtalen?"
                +
                "Svara på svenska. Svara i JSON format: {\"briefing\": \"...\", \"topConcern\": \"...\", \"suggestedAgenda\": [...] }";

        try {
            String jsonResponse = geminiService.generateJsonContent(prompt);
            return objectMapper.readValue(jsonResponse, new TypeReference<>() {
            });
        } catch (Exception e) {
            logger.error("Failed to generate Mentor student overview: {}", e.getMessage());
            return Map.of("briefing", "Problem att hämta AI-insikter.", "topConcern", "Okänt", "suggestedAgenda",
                    List.of("Individuella samtal"));
        }
    }
}
