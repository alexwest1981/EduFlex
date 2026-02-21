package com.eduflex.backend.service.ai;

import com.eduflex.backend.service.EduAiHubService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EduAiRecommendationService {

    private final EduAiHubService eduAiHubService;

    @Data
    @Builder
    public static class Recommendation {
        private String type; // SESSION, REVIEW, GAME
        private String category; // Teori, Praktik, Analys, Focus
        private String title;
        private String description;
        private String actionLabel;
        private String sessionType; // SUMMARY, PRACTICE, EXAM_PREP
        private int priority; // 1 (Highest) - 5 (Lowest)
    }

    public List<Recommendation> getRecommendations(Long userId) {
        Map<String, Integer> stats = eduAiHubService.getRadarStats(userId);
        List<Recommendation> recommendations = new ArrayList<>();

        // Logic: Identify gaps and suggest actions

        // 1. Analys (EXAM_PREP)
        int analysScore = stats.getOrDefault("Analys", 0);
        if (analysScore < 60) {
            recommendations.add(Recommendation.builder()
                    .type("SESSION")
                    .category("Analys")
                    .sessionType("EXAM_PREP")
                    .title("Boosta din Analysförmåga")
                    .description(
                            "Dina analyspoäng är lite låga. Ett tentaplugg-pass med AI kan hjälpa dig att se mönster och djupare sammanhang.")
                    .actionLabel("Starta Tentaplugg")
                    .priority(analysScore < 30 ? 1 : 2)
                    .build());
        }

        // 2. Teori (SUMMARY)
        int teoriScore = stats.getOrDefault("Teori", 0);
        if (teoriScore < 70) {
            recommendations.add(Recommendation.builder()
                    .type("SESSION")
                    .category("Teori")
                    .sessionType("SUMMARY")
                    .title("Stärk din Teoretiska Grund")
                    .description(
                            "Vi ser att du kan vinna på att repetera teorin. Låt AI:n sammanfatta de viktigaste delarna för dig.")
                    .actionLabel("Starta Sammanfattning")
                    .priority(teoriScore < 40 ? 1 : 3)
                    .build());
        }

        // 3. Praktik (PRACTICE)
        int praktikScore = stats.getOrDefault("Praktik", 0);
        if (praktikScore < 70) {
            recommendations.add(Recommendation.builder()
                    .type("SESSION")
                    .category("Praktik")
                    .sessionType("PRACTICE")
                    .title("Dags för Praktisk Övning")
                    .description(
                            "Praktik ger färdighet! Kör ett gäng övningsuppgifter för att befästa det du lärt dig.")
                    .actionLabel("Starta Övningar")
                    .priority(praktikScore < 40 ? 1 : 3)
                    .build());
        }

        // 4. Focus (Daily Review)
        int focusScore = stats.getOrDefault("Focus", 0);
        if (focusScore < 50) {
            recommendations.add(Recommendation.builder()
                    .type("REVIEW")
                    .category("Focus")
                    .title("Håll Fokusen Uppe")
                    .description(
                            "Din repetitions-streak börjar svalna. Gör din dagliga genomgång för att hålla kunskapen färsk.")
                    .actionLabel("Gör Repetition")
                    .priority(1)
                    .build());
        }

        // Sort by priority and score (lowest score first)
        recommendations.sort((a, b) -> {
            if (a.getPriority() != b.getPriority()) {
                return Integer.compare(a.getPriority(), b.getPriority());
            }
            return Integer.compare(stats.getOrDefault(a.getCategory(), 0), stats.getOrDefault(b.getCategory(), 0));
        });

        return recommendations;
    }
}
