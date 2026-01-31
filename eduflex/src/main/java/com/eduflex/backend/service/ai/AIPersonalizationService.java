package com.eduflex.backend.service.ai;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIPersonalizationService {

    private static final Logger logger = LoggerFactory.getLogger(AIPersonalizationService.class);

    private final GeminiService geminiService;
    private final StudentActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final CourseMaterialRepository materialRepository;
    private final LessonRepository lessonRepository;
    private final ObjectMapper objectMapper;

    public AIPersonalizationService(GeminiService geminiService,
            StudentActivityLogRepository activityLogRepository,
            UserRepository userRepository,
            CourseMaterialRepository materialRepository,
            LessonRepository lessonRepository,
            ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
        this.materialRepository = materialRepository;
        this.lessonRepository = lessonRepository;
        this.objectMapper = objectMapper;
    }

    private static final String PERSONALIZATION_SYSTEM_PROMPT = """
            Du är en expert på adaptivt lärande och studentanalys.
            Din uppgift är att analysera en students aktivitetsdata och ge insikter om prestationer och rekommendationer.

            FORMAT:
            Du MÅSTE svara med giltig JSON som följer denna struktur:
            {
              "riskLevel": 45, // 0-100 (0 = ingen risk, 100 = avhoppsrisk)
              "riskRationale": "Professionell analys för LÄRAREN (t.ex. 'Studenten har inte loggat in på 3 dagar'). Skrivs i tredje person.",
              "recommendations": [
                {
                  "type": "LESSON", // Eller "MATERIAL"
                  "id": 123,
                  "title": "Titel på innehållet",
                  "reason": "Vänlig förklaring till STUDENTEN (t.ex. 'Det här hjälper dig repetera grunderna inför nästa del'). Skrivs i andra person."
                }
              ],
              "studyPathAdvice": "Peppande coachande råd direkt till STUDENTEN (t.ex. 'Du gör bra ifrån dig! Fokusera på att...'). Skrivs i andra person."
            }
            """;

    public Map<String, Object> analyzeStudentPerformance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // 1. Collect recent activity (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<StudentActivityLog> logs = activityLogRepository.findByUserIdOrderByTimestampDesc(userId)
                .stream()
                .filter(l -> l.getTimestamp().isAfter(thirtyDaysAgo))
                .collect(Collectors.toList());

        // 2. Build summary for the AI
        StringBuilder activitySummary = new StringBuilder();
        activitySummary.append("Student: ").append(user.getFullName()).append("\n");
        activitySummary.append("Senaste 30 dagarnas aktivitet:\n");

        for (StudentActivityLog log : logs) {
            activitySummary.append(String.format("- [%s] %s",
                    log.getTimestamp().toLocalDate(),
                    log.getActivityType()));
            if (log.getCourse() != null)
                activitySummary.append(" i kurs: ").append(log.getCourse().getName());
            if (log.getDetails() != null)
                activitySummary.append(" (").append(log.getDetails()).append(")");
            activitySummary.append("\n");
        }

        // 3. Add context about available materials for recommendations
        // For simplicity, we only suggest from courses the student is enrolled in
        activitySummary.append("\nTillgängliga material/lektioner i studentens kurser:\n");
        for (Course course : user.getCourses()) {
            activitySummary.append("Kurs: ").append(course.getName()).append("\n");
            // Assuming we have access to materials/lessons
            List<Lesson> lessons = lessonRepository.findByCourseIdOrderBySortOrderAsc(course.getId());
            for (Lesson l : lessons) {
                activitySummary.append(String.format("  - LESSON ID:%d: %s\n", l.getId(), l.getTitle()));
            }
        }

        // 4. Call Gemini
        String prompt = PERSONALIZATION_SYSTEM_PROMPT + "\n\nAKTIVITETSDATA:\n" + activitySummary.toString();

        try {
            String response = geminiService.generateResponse(prompt);
            // Gemini might wrap in markdown blocks, GeminiService has cleanJsonResponse but
            // it's private.
            // Actually generateResponse in GeminiService doesn't constrain to JSON unless
            // asked.
            // Let's use callGemini if possible. But it's also private.

            // I'll manually clean if needed or assume Gemini follows the "Return only valid
            // JSON" rule from prompt.
            String cleanedResponse = cleanJson(response);
            return objectMapper.readValue(cleanedResponse, Map.class);
        } catch (Exception e) {
            logger.error("Failed to analyze student performance with AI", e);
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("riskLevel", 0);
            fallback.put("riskRationale", "Kunde inte generera AI-analys just nu.");
            fallback.put("recommendations", new ArrayList<>());
            return fallback;
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
