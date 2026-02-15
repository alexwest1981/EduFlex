package com.eduflex.backend.service;

import com.eduflex.backend.dto.AdaptiveDashboardDTO;
import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.AdaptiveLearningProfileRepository;
import com.eduflex.backend.repository.AdaptiveRecommendationRepository;
import com.eduflex.backend.repository.CourseResultRepository;

import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.ai.GeminiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdaptiveLearningService {

        private final AdaptiveLearningProfileRepository profileRepository;
        private final AdaptiveRecommendationRepository recommendationRepository;
        private final CourseResultRepository courseResultRepository;
        private final UserRepository userRepository;
        private final GeminiService geminiService;
        private final ObjectMapper objectMapper;
        private final AiAuditService aiAuditService;

        @Transactional
        public AdaptiveDashboardDTO getStudentDashboard(Long userId) {
                User student = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                AdaptiveLearningProfile profile = profileRepository.findByUser(student)
                                .orElseGet(() -> createInitialProfile(student));

                List<AdaptiveRecommendation> recommendations = recommendationRepository
                                .findByUserIdAndStatusInOrderByPriorityScoreDesc(userId,
                                                Arrays.asList(AdaptiveRecommendation.Status.NEW,
                                                                AdaptiveRecommendation.Status.IN_PROGRESS));

                return AdaptiveDashboardDTO.builder()
                                .profile(profile)
                                .recommendations(recommendations)
                                .build();
        }

        @Transactional
        public AdaptiveLearningProfile createInitialProfile(User student) {
                // Create a default profile
                AdaptiveLearningProfile profile = new AdaptiveLearningProfile();
                profile.setUser(student);
                // Default balanced scores
                profile.setVisualScore(50);
                profile.setAuditoryScore(50);
                profile.setKinestheticScore(50);
                profile.setPacePreference(AdaptiveLearningProfile.LearningPace.MODERATE);
                profile.setStruggleAreas("[]");
                profile.setStrengthAreas("[]");
                profile.setLastAnalyzed(null);

                try {
                        return profileRepository.save(profile);
                } catch (Exception e) {
                        log.error("Failed to save profile for user {}", student.getId(), e);
                        throw e;
                }
        }

        public void analyzeStudentPerformance(Long userId) {
                log.info("Starting Adaptive Analysis for user: {}", userId);

                User student = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // 1. Gather all student data
                String performanceData = gatherStudentPerformanceContext(student);

                // 2. Prepare Prompt
                String prompt = String.format(
                                """
                                                Du är en expert-pedagog inom EduFlex LMS.
                                                Analysera följande data för studenten och skapa en personlig läroprofil.
                                                Datan innehåller betyg, närvaro, quiz-resultat och varningsflaggor.

                                                Din uppgift är att skapa en detaljerad profil och rekommendationer.
                                                Svara ENDAST med giltig JSON i följande format:
                                                {
                                                  "visualScore": (0-100, uppskattning baserat på ämnen),
                                                  "auditoryScore": (0-100),
                                                  "kinestheticScore": (0-100),
                                                  "pacePreference": "SLOW", "MODERATE", eller "FAST",
                                                  "struggleAreas": ["område1", "område2"],
                                                  "strengthAreas": ["område1", "område2"],
                                                  "recommendations": [
                                                    {
                                                      "title": "Titel",
                                                      "description": "Beskrivning",
                                                      "type": "CONTENT_REVIEW" | "PRACTICE_QUIZ" | "ADVANCED_TOPIC" | "MENTOR_MEETING" | "STREAK_REPAIR",
                                                      "reasoningTrace": "En detaljerad, pedagogisk förklaring till varför just denna rekommendation ges.",
                                                      "priorityScore": (0-100, hur viktig är denna åtgärd?)
                                                    }
                                                  ]
                                                }
                                                """,
                                performanceData);

                // 3. AI Analysis Execution
                try {
                        String jsonResponse = geminiService.generateJsonContent(prompt);

                        // --- Audit Logging (Decoupled & Non-blocking) ---
                        aiAuditService.saveAiAuditLog(userId, prompt, jsonResponse);
                        // ---------------------

                        String cleanedResponse = cleanJson(jsonResponse);
                        JsonNode root = objectMapper.readTree(cleanedResponse);

                        // 4. Update Profile
                        AdaptiveLearningProfile profile = profileRepository.findByUser(student)
                                        .orElseGet(() -> createInitialProfile(student));

                        if (root.has("visualScore"))
                                profile.setVisualScore(root.get("visualScore").asInt());
                        if (root.has("auditoryScore"))
                                profile.setAuditoryScore(root.get("auditoryScore").asInt());
                        if (root.has("kinestheticScore"))
                                profile.setKinestheticScore(root.get("kinestheticScore").asInt());

                        if (root.has("pacePreference")) {
                                try {
                                        profile.setPacePreference(AdaptiveLearningProfile.LearningPace
                                                        .valueOf(root.get("pacePreference").asText().toUpperCase()));
                                } catch (IllegalArgumentException e) {
                                        profile.setPacePreference(AdaptiveLearningProfile.LearningPace.MODERATE);
                                }
                        }

                        if (root.has("struggleAreas")) {
                                profile.setStruggleAreas(root.get("struggleAreas").toString());
                        }
                        if (root.has("strengthAreas")) {
                                profile.setStrengthAreas(root.get("strengthAreas").toString());
                        }

                        profile.setLastAnalyzed(LocalDateTime.now());
                        profileRepository.save(profile);

                        // 5. Handle Recommendations
                        // Archive old pending recommendations
                        List<AdaptiveRecommendation> oldRecs = recommendationRepository
                                        .findByUserIdAndStatusOrderByPriorityScoreDesc(userId,
                                                        AdaptiveRecommendation.Status.NEW);
                        for (AdaptiveRecommendation old : oldRecs) {
                                try {
                                        old.setStatus(AdaptiveRecommendation.Status.INVALIDATED);
                                        recommendationRepository.save(old);
                                } catch (Exception e) {
                                        log.error("Failed to invalidate old recommendation: {}", old.getId(), e);
                                }
                        }

                        JsonNode recsNode = null;
                        log.error("DEBUG: Root isArray: {}, hasRecommendations: {}", root.isArray(),
                                        root.has("recommendations"));

                        if (root.isArray()) {
                                recsNode = root;
                        } else if (root.has("recommendations")) {
                                recsNode = root.get("recommendations");
                        }

                        if (recsNode != null && recsNode.isArray()) {
                                for (JsonNode recNode : recsNode) {
                                        createRecommendation(student,
                                                        recNode.path("title").asText("Rekommendation"),
                                                        recNode.path("description").asText(""),
                                                        recNode.path("type").asText("CONTENT_REVIEW"),
                                                        recNode.path("reasoningTrace")
                                                                        .asText("AI-Analys saknas"),
                                                        recNode.path("priorityScore").asInt(50));
                                }
                        } else {
                                log.warn("No recommendations found in AI response for user {}", userId);
                        }

                } catch (Exception e) {
                        log.error("Failed to analyze student performance", e);
                }
        }

        private String gatherStudentPerformanceContext(User student) {
                List<CourseResult> results = courseResultRepository.findByStudentId(student.getId());

                if (results.isEmpty()) {
                        return "Studenten har inte slutfört några kurser än. Detta är en ny student som behöver en introduktion.";
                } else {
                        StringBuilder sb = new StringBuilder();
                        for (CourseResult result : results) {
                                sb.append("- Kurs: ").append(result.getCourse().getName())
                                                .append(", Betyg: ").append(result.getGrade())
                                                .append(", Status: ").append(result.getStatus())
                                                .append("\n");
                        }
                        return sb.toString();
                }
        }

        private void createRecommendation(User user, String title, String description,
                        String typeStr, String reasoningTrace, int priorityScore) {

                AdaptiveRecommendation.RecommendationType type;
                try {
                        type = AdaptiveRecommendation.RecommendationType.valueOf(typeStr);
                } catch (IllegalArgumentException e) {
                        type = AdaptiveRecommendation.RecommendationType.CONTENT_REVIEW;
                }

                AdaptiveRecommendation rec = new AdaptiveRecommendation();
                rec.setUser(user);
                rec.setTitle(title);
                rec.setDescription(description);
                rec.setType(type);
                rec.setReasoningTrace(reasoningTrace);
                rec.setAiReasoning("AI-Generated Recommendation based on performance.");
                rec.setStatus(AdaptiveRecommendation.Status.NEW);
                rec.setPriorityScore(priorityScore);

                try {
                        recommendationRepository.save(rec);
                } catch (Exception e) {
                        log.error("Failed to save new recommendation: {}", rec.getTitle(), e);
                }
        }

        @Transactional
        public void updateRecommendationStatus(Long recommendationId, AdaptiveRecommendation.Status status,
                        Long userId) {
                AdaptiveRecommendation rec = recommendationRepository.findById(recommendationId)
                                .orElseThrow(() -> new RuntimeException("Recommendation not found"));

                if (!rec.getUser().getId().equals(userId)) {
                        throw new RuntimeException("Unauthorized to update this recommendation");
                }

                rec.setStatus(status);
                try {
                        recommendationRepository.save(rec);
                } catch (Exception e) {
                        log.error("Failed to save new recommendation: {}", rec.getTitle(), e);
                }
        }

        private String cleanJson(String response) {
                if (response == null)
                        return "{}";
                int start = response.indexOf("{");
                int end = response.lastIndexOf("}");
                if (start >= 0 && end > start) {
                        return response.substring(start, end + 1);
                }
                return response;
        }
}
