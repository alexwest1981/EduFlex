package com.eduflex.backend.service;

import com.eduflex.backend.dto.AdaptiveDashboardDTO;
import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.AdaptiveLearningProfileRepository;
import com.eduflex.backend.repository.AdaptiveRecommendationRepository;
import com.eduflex.backend.repository.CourseResultRepository;
import com.eduflex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.eduflex.backend.service.ai.GeminiService;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdaptiveLearningService {

        private final AdaptiveLearningProfileRepository profileRepository;
        private final AdaptiveRecommendationRepository recommendationRepository;
        private final CourseResultRepository courseResultRepository;
        private final UserRepository userRepository;
        private final GeminiService geminiService;
        private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

        @Transactional
        public AdaptiveDashboardDTO getStudentDashboard(Long userId) {
                User student = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                AdaptiveLearningProfile profile = profileRepository.findByUser(student)
                                .orElseGet(() -> createInitialProfile(student));

                List<AdaptiveRecommendation> recommendations = recommendationRepository
                                .findByUserIdAndStatusInOrderByPriorityScoreDesc(userId,
                                                Arrays.asList(AdaptiveRecommendation.Status.PENDING,
                                                                AdaptiveRecommendation.Status.ACCEPTED));

                return AdaptiveDashboardDTO.builder()
                                .profile(profile)
                                .recommendations(recommendations)
                                .build();
        }

        @Transactional
        public AdaptiveLearningProfile createInitialProfile(User student) {
                // Create a default profile
                AdaptiveLearningProfile profile = AdaptiveLearningProfile.builder()
                                .user(student)
                                .primaryLearningStyle(AdaptiveLearningProfile.LearningStyle.MIXED)
                                .averagePaceMultiplier(1.0)
                                .struggleAreas(new ArrayList<>())
                                .strengthAreas(new ArrayList<>())
                                .aiAnalysisSummary(
                                                "Ingen analys gjord än. Genomför din första kurs för att starta adaptiv inlärning.")
                                .build();
                return profileRepository.save(profile);
        }

        @Transactional
        public void analyzeStudentPerformance(Long userId) {
                log.info("Starting Adaptive Analysis for user: {}", userId);
                User student = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // 1. Gather Data
                List<CourseResult> results = courseResultRepository.findByStudentId(student.getId());

                String performanceData;
                if (results.isEmpty()) {
                        performanceData = "Studenten har inte slutfört några kurser än. Detta är en ny student som behöver en introduktion.";
                } else {
                        StringBuilder sb = new StringBuilder();
                        for (CourseResult result : results) {
                                sb.append("- Kurs: ").append(result.getCourse().getName())
                                                .append(", Betyg: ").append(result.getGrade())
                                                .append(", Status: ").append(result.getStatus())
                                                .append("\n");
                        }
                        performanceData = sb.toString();
                }

                // 2. AI Analysis
                try {
                        String jsonResponse = geminiService.analyzeStudentPerformance(performanceData);
                        com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(jsonResponse);

                        // 3. Update Profile
                        AdaptiveLearningProfile profile = profileRepository.findByUser(student)
                                        .orElseGet(() -> createInitialProfile(student));

                        if (root.has("analysisSummary")) {
                                profile.setAiAnalysisSummary(root.get("analysisSummary").asText());
                        }
                        if (root.has("struggleAreas")) {
                                List<String> struggles = new ArrayList<>();
                                root.get("struggleAreas").forEach(n -> struggles.add(n.asText()));
                                profile.setStruggleAreas(struggles);
                        }
                        if (root.has("strengthAreas")) {
                                List<String> strengths = new ArrayList<>();
                                root.get("strengthAreas").forEach(n -> strengths.add(n.asText()));
                                profile.setStrengthAreas(strengths);
                        }
                        if (root.has("paceEvaluation")) {
                                String pace = root.get("paceEvaluation").asText("BALANCED");
                                switch (pace.toUpperCase()) {
                                        case "SLOW" -> profile.setAveragePaceMultiplier(1.2); // Mer tid
                                        case "FAST" -> profile.setAveragePaceMultiplier(0.8); // Snabbare
                                        default -> profile.setAveragePaceMultiplier(1.0);
                                }
                        }
                        profileRepository.save(profile);

                        // Archive old pending recommendations
                        List<AdaptiveRecommendation> oldRecs = recommendationRepository
                                        .findByUserIdAndStatusOrderByPriorityScoreDesc(userId,
                                                        AdaptiveRecommendation.Status.PENDING);
                        for (AdaptiveRecommendation old : oldRecs) {
                                old.setStatus(AdaptiveRecommendation.Status.EXPIRED);
                                recommendationRepository.save(old);
                        }

                        if (root.has("recommendations")) {
                                com.fasterxml.jackson.databind.JsonNode recsNode = root.get("recommendations");
                                if (recsNode.isArray()) {
                                        for (com.fasterxml.jackson.databind.JsonNode recNode : recsNode) {
                                                String typeStr = recNode.has("type") ? recNode.get("type").asText()
                                                                : "CHALLENGE_YOURSELF";
                                                AdaptiveRecommendation.RecommendationType type;
                                                try {
                                                        type = AdaptiveRecommendation.RecommendationType
                                                                        .valueOf(typeStr);
                                                } catch (IllegalArgumentException e) {
                                                        type = AdaptiveRecommendation.RecommendationType.CHALLENGE_YOURSELF;
                                                }

                                                createRecommendation(student,
                                                                recNode.path("title").asText("Rekommendation"),
                                                                recNode.path("description").asText(""),
                                                                type,
                                                                recNode.path("reasoning").asText("AI-Analys"));
                                        }
                                }
                        }

                } catch (Exception e) {
                        log.error("Failed to analyze student performance", e);
                        // Fallback handled by keeping old data or throwing
                }
        }

        private void createRecommendation(User user, String title, String description,
                        AdaptiveRecommendation.RecommendationType type, String reasoning) {
                AdaptiveRecommendation rec = AdaptiveRecommendation.builder()
                                .user(user)
                                .title(title)
                                .description(description)
                                .type(type)
                                .aiReasoning(reasoning)
                                .status(AdaptiveRecommendation.Status.PENDING)
                                .priorityScore(80) // Default score, could be AI driven too
                                .build();
                recommendationRepository.save(rec);
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
                recommendationRepository.save(rec);
        }
}
