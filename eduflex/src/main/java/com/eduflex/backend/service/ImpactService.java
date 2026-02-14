package com.eduflex.backend.service;

import com.eduflex.backend.model.AdaptiveLearningProfile;
import com.eduflex.backend.model.CourseResult;
import com.eduflex.backend.model.ElevhalsaCase;
import com.eduflex.backend.repository.AdaptiveLearningProfileRepository;
import com.eduflex.backend.repository.CourseResultRepository;
import com.eduflex.backend.repository.ElevhalsaCaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ImpactService {

    private final CourseResultRepository courseResultRepository;
    private final ElevhalsaCaseRepository caseRepository;
    private final AdaptiveLearningProfileRepository profileRepository;

    public ImpactService(CourseResultRepository courseResultRepository,
            ElevhalsaCaseRepository caseRepository,
            AdaptiveLearningProfileRepository profileRepository) {
        this.courseResultRepository = courseResultRepository;
        this.caseRepository = caseRepository;
        this.profileRepository = profileRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSchoolOverview() {
        Map<String, Object> overview = new HashMap<>();

        // 1. Intervention Impact
        List<ElevhalsaCase> closedCases = caseRepository.findAll().stream()
                .filter(c -> c.getStatus() == ElevhalsaCase.Status.CLOSED
                        || c.getStatus() == ElevhalsaCase.Status.RESOLVED)
                .collect(Collectors.toList());

        int improvedGradesCount = 0;
        for (ElevhalsaCase eCase : closedCases) {
            if (hasImproved(eCase.getStudent().getId(), eCase.getCreatedAt())) {
                improvedGradesCount++;
            }
        }

        overview.put("totalInterventions", closedCases.size());
        overview.put("successfulInterventions", improvedGradesCount);
        overview.put("successRate",
                closedCases.isEmpty() ? 0 : (double) improvedGradesCount / closedCases.size() * 100);

        // 2. AI Impact
        List<AdaptiveLearningProfile> activeProfiles = profileRepository.findAll();
        double aiUserAvgGrade = calculateAverageGrade(
                activeProfiles.stream().map(p -> p.getUser().getId()).collect(Collectors.toList()));

        // Non-AI users (mock logic for now, or fetch all users minus active profiles)
        // For distinct comparison, we'd need a more complex query, but let's start with
        // AI users average.
        overview.put("aiUserAverageGrade", aiUserAvgGrade);
        overview.put("activeAiStudents", activeProfiles.size());

        return overview;
    }

    private boolean hasImproved(Long studentId, LocalDateTime interventionDate) {
        List<CourseResult> results = courseResultRepository.findByStudentId(studentId);

        // Simple logic: Check if average grade point AFTER intervention is higher than
        // BEFORE
        double beforeAvg = calculateAverageGradeFromList(results.stream()
                .filter(r -> r.getGradedAt() != null && r.getGradedAt().isBefore(interventionDate))
                .collect(Collectors.toList()));

        double afterAvg = calculateAverageGradeFromList(results.stream()
                .filter(r -> r.getGradedAt() != null && r.getGradedAt().isAfter(interventionDate))
                .collect(Collectors.toList()));

        return afterAvg > beforeAvg;
    }

    private double calculateAverageGrade(List<Long> studentIds) {
        if (studentIds.isEmpty())
            return 0.0;
        List<CourseResult> allResults = courseResultRepository.findByStudentIdIn(studentIds);
        return calculateAverageGradeFromList(allResults);
    }

    private double calculateAverageGradeFromList(List<CourseResult> results) {
        if (results.isEmpty())
            return 0.0;

        int totalPoints = 0;
        int count = 0;

        for (CourseResult r : results) {
            int points = gradeToPoints(r.getGrade());
            if (points > 0) {
                totalPoints += points;
                count++;
            }
        }

        return count == 0 ? 0.0 : (double) totalPoints / count;
    }

    private int gradeToPoints(String grade) {
        if (grade == null)
            return 0;
        switch (grade.toUpperCase()) {
            case "A":
                return 20;
            case "B":
                return 17;
            case "C":
                return 15;
            case "D":
                return 12;
            case "E":
                return 10;
            case "F":
                return 0;
            default:
                return 0;
        }
    }
}
