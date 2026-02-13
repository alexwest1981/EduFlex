package com.eduflex.backend.service;

import com.eduflex.backend.model.User;
import com.eduflex.backend.service.ai.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GuardianReportService {

    private final GuardianDashboardService guardianDashboardService;
    private final UserService userService;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    private static final String GUARDIAN_PROMPT = """
            Du är en stöttande och informativ AI-coach för föräldrar/vårdnadshavare.
            Din uppgift är att sammanfatta elevens nuvarande skolsituation baserat på tillgänglig data.

            FÖRHÅLLNINGSSÄTT:
            - Var uppmuntrande men ärlig.
            - Fokusera på framsteg, utmaningar och nästa steg.
            - Skriv på ett begripligt språk för föräldrar (undvik för mycket "pedagogiska" termer).
            - Rapporten ska vara kortfattad (max 3-4 stycken).
            - Språk: SVENSKA.

            STRUKTUR:
            1. Övergripande läge (Närvaro och trivsel).
            2. Studieresultat (Betyg och prestationer).
            3. Kommande fokus (Läxor eller prov nästa vecka).
            4. En positiv avslutning eller ett konkret råd.

            OBS: Svara ENDAST med markdown-texten för sammanfattningen. Använd gärna emojis för att göra den mer lättläst.
            """;

    public String generateSummary(Long studentId) {
        try {
            User student = userService.getUserById(studentId);
            if (student == null) {
                throw new RuntimeException("Elev hittades inte");
            }

            Map<String, Object> metrics = guardianDashboardService.getChildDashboardMetrics(student);
            String metricsJson = objectMapper.writeValueAsString(metrics);

            String prompt = GUARDIAN_PROMPT + "\n\nDATA FÖR ELEVEN (" + student.getFullName() + "):\n" + metricsJson;

            return geminiService.generateResponse(prompt);
        } catch (Exception e) {
            log.error("Failed to generate guardian summary", e);
            return "Tyvärr kunde vi inte generera en sammanfattning just nu. Vänligen titta på detaljerna nedan.";
        }
    }
}
