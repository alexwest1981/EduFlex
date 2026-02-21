package com.eduflex.backend.service;

import com.eduflex.backend.dto.RoiDataPoint;
import com.eduflex.backend.model.AiSessionResult;
import com.eduflex.backend.model.BusinessOutcome;
import com.eduflex.backend.repository.AiSessionResultRepository;
import com.eduflex.backend.repository.BusinessOutcomeRepository;
import com.eduflex.backend.service.ai.GeminiService;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RoiService {

    private final BusinessOutcomeRepository businessOutcomeRepository;
    private final AiSessionResultRepository aiSessionResultRepository;
    private final GeminiService geminiService;

    public RoiService(BusinessOutcomeRepository businessOutcomeRepository,
            AiSessionResultRepository aiSessionResultRepository,
            GeminiService geminiService) {
        this.businessOutcomeRepository = businessOutcomeRepository;
        this.aiSessionResultRepository = aiSessionResultRepository;
        this.geminiService = geminiService;
    }

    public List<RoiDataPoint> getRoiDataPoints(Long courseId) {
        List<BusinessOutcome> outcomes = businessOutcomeRepository.findByCourseId(courseId);
        List<AiSessionResult> sessionResults = aiSessionResultRepository.findByCourseId(courseId);

        // Map userId -> average mastery score
        Map<Long, Double> userMasteryMap = sessionResults.stream()
                .collect(Collectors.groupingBy(r -> r.getUser().getId(),
                        Collectors.averagingDouble(r -> (r.getScore() * 100.0) / r.getMaxScore())));

        List<RoiDataPoint> dataPoints = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        for (BusinessOutcome outcome : outcomes) {
            Long userId = outcome.getUser().getId();
            if (userMasteryMap.containsKey(userId)) {
                dataPoints.add(RoiDataPoint.builder()
                        .studentName(outcome.getUser().getFirstName() + " " + outcome.getUser().getLastName())
                        .studentEmail(outcome.getUser().getEmail())
                        .masteryScore(userMasteryMap.get(userId).intValue())
                        .metricName(outcome.getMetricName())
                        .metricValue(outcome.getMetricValue())
                        .dateRecorded(outcome.getRecordedAt().format(formatter))
                        .build());
            }
        }
        return dataPoints;
    }

    public Map<String, Object> calculateRoiStats(Long courseId) {
        List<RoiDataPoint> points = getRoiDataPoints(courseId);
        Map<String, Object> stats = new HashMap<>();

        if (points.isEmpty()) {
            stats.put("correlation", 0.0);
            stats.put("message", "Ingen data tillgänglig för korrelation.");
            return stats;
        }

        double correlation = calculatePearsonCorrelation(points);
        stats.put("correlation", correlation);
        stats.put("dataPointsCount", points.size());

        // Interpret correlation
        String trend = "Neutral";
        if (correlation > 0.7)
            trend = "Väldigt Stark Positiv";
        else if (correlation > 0.4)
            trend = "Stark Positiv";
        else if (correlation > 0.1)
            trend = "Svag Positiv";
        else if (correlation < -0.1)
            trend = "Negativ";

        stats.put("trend", trend);
        return stats;
    }

    public String getRoiAiInsight(Long courseId) {
        Map<String, Object> stats = calculateRoiStats(courseId);
        double correlation = (double) stats.get("correlation");
        String trend = (String) stats.get("trend");
        int count = (int) stats.get("dataPointsCount");

        String prompt = String.format("""
                Du är en expert på ROI och utbildningsanalys.
                Analysera följande data för en kurs och ge en kort pedagogisk/affärsmässig insikt (max 3 meningar).

                Data:
                - Antal datapunkter: %d
                - Pearson Korrelation (Mellan kunskapskontroll och affärsmål): %.2f
                - Trend: %s

                Förklara vad detta innebär för företaget och om utbildningen ger önskad effekt.
                """, count, correlation, trend);

        return geminiService.generateControlCenterInsight(prompt);
    }

    private double calculatePearsonCorrelation(List<RoiDataPoint> points) {
        int n = points.size();
        if (n < 2)
            return 0.0;

        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

        for (RoiDataPoint p : points) {
            double x = p.getMasteryScore();
            double y = p.getMetricValue();
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
            sumY2 += y * y;
        }

        double numerator = n * sumXY - sumX * sumY;
        double denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        if (denominator == 0)
            return 0.0;
        return numerator / denominator;
    }
}
