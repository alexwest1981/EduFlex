package com.eduflex.backend.service.ai;

import com.eduflex.backend.service.PrincipalDashboardService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrincipalAiCoachService {

    private final GeminiService geminiService;
    private final PrincipalDashboardService principalDashboardService;

    @Data
    @Builder
    public static class PrincipalAiCoachInsight {
        private String executiveSummary; // Övergripande "Hälso-check" för skolan
        private String anomalyAlert; // Eventuella avvikelser (t.ex. hög frånvaro i en specifik avdelning)
        private String strategicAdvice; // Strategiskt råd baserat på ekonomi/manning/resultat
        private String trendAnalysis; // Analys av aktivitetstrenden
    }

    public PrincipalAiCoachInsight getPrincipalInsight() {
        // 1. Get School Metrics
        Map<String, Object> metrics = principalDashboardService.getSchoolMetrics();

        // 2. Build Prompt
        StringBuilder prompt = new StringBuilder();
        prompt.append("Du är en strategisk rådgivare och AI-coach för rektorer och skolledare på EduFlex LMS.\n\n");
        prompt.append("SKOLANS NYCKELTAL:\n");
        prompt.append("- Närvaro: ").append(metrics.get("attendancePercentage")).append("%\n");
        prompt.append("- Personal (Manning): ").append(metrics.get("staffManningPercentage")).append("%\n");
        prompt.append("- Sjukskriven personal: ").append(metrics.get("sickStaffCount")).append("\n");
        prompt.append("- Aktiva incidenter: ").append(metrics.get("activeIncidents")).append("\n");
        prompt.append("- Betygs-progress: ").append(metrics.get("gradingProgressPercentage")).append("%\n");
        prompt.append("- Obetalda avgifter: ").append(metrics.get("unpaidFeesCount")).append("\n");
        prompt.append("- Öppna hälsoärenden: ").append(metrics.get("openHealthCases")).append("\n");
        prompt.append("- Aktivitetstrend (senaste 7 dagarna): ").append(metrics.get("trendData")).append("\n");

        prompt.append("\nUPPGIFT:\n");
        prompt.append("Skapa en 'Executive Insight' för rektorn i JSON-format.\n");
        prompt.append("JSON FORMAT:\n");
        prompt.append("{\n");
        prompt.append("  \"executiveSummary\": \"En kort statusuppdatering om skolans hälsa (max 20 ord).\",\n");
        prompt.append(
                "  \"anomalyAlert\": \"Om du ser något oroväckande (t.ex. låg närvaro + incidenter), nämn det här. Annars 'Allt ser stabilt ut'.\",\n");
        prompt.append(
                "  \"strategicAdvice\": \"Ett strategiskt råd (t.ex. fokusera på att bemanna vakanser eller driva in avgifter).\",\n");
        prompt.append(
                "  \"trendAnalysis\": \"Analysera om engagemanget går upp eller ner och vad det kan innebära.\"\n");
        prompt.append("}\n");
        prompt.append("Svara på svenska.");

        try {
            String jsonResponse = geminiService.generateJsonContent(prompt.toString());
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(jsonResponse);

            return PrincipalAiCoachInsight.builder()
                    .executiveSummary(root.path("executiveSummary")
                            .asText("Skolan presterar väl med stabil närvaro och god progression."))
                    .anomalyAlert(root.path("anomalyAlert").asText("Inga större avvikelser identifierade."))
                    .strategicAdvice(root.path("strategicAdvice")
                            .asText("Fortsätt monitorera incidentrapporteringen för att säkerställa trygghet."))
                    .trendAnalysis(root.path("trendAnalysis").asText("Aktivitetstrenden är stabil."))
                    .build();
        } catch (Exception e) {
            log.error("Failed to generate Principal AI Coach insight", e);
            return PrincipalAiCoachInsight.builder()
                    .executiveSummary("Kunde inte generera skolsammanfattning just nu.")
                    .strategicAdvice("Se över dagens nyckeltal manuellt i kontrollpanelen.")
                    .build();
        }
    }
}
