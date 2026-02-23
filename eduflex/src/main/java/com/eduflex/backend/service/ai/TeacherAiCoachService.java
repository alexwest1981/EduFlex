package com.eduflex.backend.service.ai;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeacherAiCoachService {

    private final GeminiService geminiService;
    private final TeacherAnalyticsService teacherAnalyticsService;

    @Data
    @Builder
    public static class TeacherAiCoachInsight {
        private String classSummary; // Kort status på klassen ("Klassen flyger fram!")
        private List<String> interventions; // Konkreta åtgärder för de studenter som släpar efter
        private String pedagogicalTip; // Tips för nästa lektion baserat på luckor
        private String focusAnalysis; // Analys av klassens fokus-poäng
    }

    public TeacherAiCoachInsight getTeacherInsight(Long courseId) {
        // 1. Get Course Analytics
        TeacherAnalyticsService.CourseAnalytics analytics = teacherAnalyticsService.getCourseAnalytics(courseId);

        // 2. Build Prompt
        StringBuilder prompt = new StringBuilder();
        prompt.append("Du är en senior pedagogisk coach för lärare på EduFlex LMS.\n\n");
        prompt.append("KLASS-DATA (Kurs ID: ").append(courseId).append("):\n");
        prompt.append("- Aggregerad Radar: ").append(analytics.getAggregateRadar()).append("\n");
        prompt.append("- Kunskapsluckor (<60%): ").append(analytics.getLearningGaps()).append("\n");
        prompt.append("- Studenter i riskzonen (Hög/Medium risk): ").append(analytics.getLowPerformingStudents().size())
                .append("\n");
        if (!analytics.getLowPerformingStudents().isEmpty()) {
            prompt.append("- Exempel på studentproblem: ");
            analytics.getLowPerformingStudents().stream().limit(3)
                    .forEach(s -> prompt.append(s.getName()).append(" (Risk: ").append(s.getRiskLevel())
                            .append(", Orsak: ").append(s.getRiskReason()).append("); "));
            prompt.append("\n");
        }

        prompt.append("\nUPPGIFT:\n");
        prompt.append("Skapa en coachning-insikt för läraren i JSON-format.\n");
        prompt.append("JSON FORMAT:\n");
        prompt.append("{\n");
        prompt.append("  \"classSummary\": \"Kort sammanfattning av klassens läge (max 15 ord).\",\n");
        prompt.append("  \"interventions\": [\"Namn: Åtgärd\", \"Namn: Åtgärd\"], // Max 3 stycken\n");
        prompt.append(
                "  \"pedagogicalTip\": \"Ett konkret tips för nästa lektion för att täppa till de luckor vi ser.\",\n");
        prompt.append("  \"focusAnalysis\": \"Hur ser klassens engagemang ut baserat på Focus-poängen?\"\n");
        prompt.append("}\n");
        prompt.append("Svara på svenska.");

        try {
            String jsonResponse = geminiService.generateJsonContent(prompt.toString());
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(jsonResponse);

            return TeacherAiCoachInsight.builder()
                    .classSummary(root.path("classSummary")
                            .asText("Klassen har en stabil utveckling men några behöver extra stöd."))
                    .interventions(mapper.convertValue(root.path("interventions"), List.class))
                    .pedagogicalTip(root.path("pedagogicalTip")
                            .asText("Fokusera på repetition av de grundläggande koncepten under nästa pass."))
                    .focusAnalysis(root.path("focusAnalysis").asText("Engagemanget är jämnt över klassen."))
                    .build();
        } catch (Exception e) {
            log.error("Failed to generate Teacher AI Coach insight", e);
            return TeacherAiCoachInsight.builder()
                    .classSummary("Kunde inte generera analys just nu.")
                    .pedagogicalTip("Fokusera på identifierade kunskapsluckor.")
                    .focusAnalysis("Analys ej tillgänglig.")
                    .build();
        }
    }
}
