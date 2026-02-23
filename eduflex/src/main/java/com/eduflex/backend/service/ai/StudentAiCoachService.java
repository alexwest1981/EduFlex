package com.eduflex.backend.service.ai;

import com.eduflex.backend.model.League;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.AdaptiveLearningService;
import com.eduflex.backend.dto.AdaptiveDashboardDTO;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentAiCoachService {

    private final GeminiService geminiService;
    private final EduAiRecommendationService recommendationService;
    private final AdaptiveLearningService adaptiveLearningService;
    private final UserRepository userRepository;

    @Data
    @Builder
    public static class StudentAiCoachInsight {
        private String welcomeMessage; // Peppigt hej baserat på tid/status
        private String motivationTip; // Motivation baserat på Liga/XP
        private String studyRecommendation; // Baserat på Radar + VAK
        private String quickAction; // länk/label för nästa steg
    }

    public StudentAiCoachInsight getStudentInsight(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Get Gaps & Recommendations
        List<EduAiRecommendationService.Recommendation> gaps = recommendationService.getRecommendations(userId);

        // 2. Get VAK & Adaptive Profile
        AdaptiveDashboardDTO adaptiveData = adaptiveLearningService.getStudentDashboard(userId);

        // 3. League Status
        League currentLeague = user.getCurrentLeague();
        int points = user.getPoints();

        // Find next league if possible
        League nextLeague = null;
        for (League l : League.values()) {
            if (l.getMinPoints() > points) {
                if (nextLeague == null || l.getMinPoints() < nextLeague.getMinPoints()) {
                    nextLeague = l;
                }
            }
        }

        int pointsToNext = nextLeague != null ? nextLeague.getMinPoints() - points : 0;

        // 4. Build Prompt for Gemini
        StringBuilder prompt = new StringBuilder();
        prompt.append(
                "Du är en peppig och personlig AI-coach på EduFlex LMS. Din personlighet är inspirerande, stöttande och lite humoristisk.\n\n");
        prompt.append("STUDENT-DATA:\n");
        prompt.append("- Namn: ").append(user.getFirstName()).append("\n");
        prompt.append("- Nuvarande Liga: ").append(currentLeague.getDisplayName()).append(" ")
                .append(currentLeague.getIcon()).append("\n");
        prompt.append("- Poäng: ").append(points).append("\n");
        if (nextLeague != null) {
            prompt.append("- Nästa Liga: ").append(nextLeague.getDisplayName()).append(" (behöver ")
                    .append(pointsToNext).append(" poäng till)\n");
        }
        prompt.append("- Lärstil (VAK): ")
                .append("Visuell: ").append(adaptiveData.getProfile().getVisualScore())
                .append(", Auditiv: ").append(adaptiveData.getProfile().getAuditoryScore())
                .append(", Kinestetisk: ").append(adaptiveData.getProfile().getKinestheticScore()).append("\n");

        prompt.append("- Identifierade luckor (Radar): ");
        String gapsStr = gaps.stream()
                .map(r -> r.getCategory() + ": " + r.getTitle())
                .collect(Collectors.joining(", "));
        prompt.append(gapsStr.isEmpty() ? "Inga kritiska luckor just nu! Bra jobbat." : gapsStr).append("\n\n");

        prompt.append("UPPGIFT:\n");
        prompt.append("Skapa en sammanhängande coachning-insikt i JSON-format.\n");
        prompt.append("JSON FORMAT:\n");
        prompt.append("{\n");
        prompt.append("  \"welcomeMessage\": \"En kort, personlig hälsning (max 10 ord).\",\n");
        prompt.append(
                "  \"motivationTip\": \"Ett motiverade tips baserat på ligan och poäng till nästa nivå. Använd emojis.\",\n");
        prompt.append(
                "  \"studyRecommendation\": \"Ett konkret studietips baserat på deras lärostil och radardiagrammet. Om de är visuella, tipsa om att titta på en video eller rita ett diagram.\",\n");
        prompt.append(
                "  \"quickAction\": \"En etikett för en knapp, t.ex. 'Kör en repetitions-quiz' eller 'Titta på Teorivideo'\"\n");
        prompt.append("}\n");
        prompt.append("Svara på svenska.");

        try {
            String jsonResponse = geminiService.generateJsonContent(prompt.toString());
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(jsonResponse);

            return StudentAiCoachInsight.builder()
                    .welcomeMessage(
                            root.path("welcomeMessage").asText("Hej " + user.getFirstName() + "! Ready to learn?"))
                    .motivationTip(root.path("motivationTip").asText("Fortsätt samla poäng för att klättra i ligorna!"))
                    .studyRecommendation(root.path("studyRecommendation")
                            .asText("Ta en titt på dina rekommendationer för att se vad du kan öva på."))
                    .quickAction(root.path("quickAction").asText("Gå till EduAI Hub"))
                    .build();
        } catch (Exception e) {
            log.error("Failed to generate Student AI Coach insight", e);
            return StudentAiCoachInsight.builder()
                    .welcomeMessage("Hej " + user.getFirstName() + "!")
                    .motivationTip("Du gör ett grymt jobb i " + currentLeague.getDisplayName() + "!")
                    .studyRecommendation("Fokusera på dina svagaste områden i radardiagrammet idag.")
                    .quickAction("Öppna AI Hub")
                    .build();
        }
    }
}
