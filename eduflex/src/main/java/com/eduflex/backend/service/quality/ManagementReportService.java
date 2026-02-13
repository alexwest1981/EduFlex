package com.eduflex.backend.service.quality;

import com.eduflex.backend.model.StudentRiskFlag;
import com.eduflex.backend.model.quality.ManagementReport;
import com.eduflex.backend.model.quality.QualityGoal;
import com.eduflex.backend.model.quality.QualityIndicator;
import com.eduflex.backend.repository.*;
import com.eduflex.backend.repository.quality.ManagementReportRepository;
import com.eduflex.backend.repository.quality.QualityGoalRepository;
import com.eduflex.backend.repository.quality.QualityIndicatorRepository;
import com.eduflex.backend.service.ai.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ManagementReportService {

    private final ManagementReportRepository reportRepository;
    private final QualityGoalRepository goalRepository;
    private final QualityIndicatorRepository indicatorRepository;
    private final AttendanceRepository attendanceRepository;
    private final CourseResultRepository courseResultRepository;
    private final IncidentReportRepository incidentReportRepository;
    private final StudentRiskFlagRepository riskFlagRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;

    private static final String REPORT_SYSTEM_PROMPT = """
            Du är en expert på skolförbättring och strategiskt ledarskap inom utbildning.
            Din uppgift är att skriva en professionell ledningsrapport (Ledningsrapport) baserat på insamlad data från ett LMS.

            RAPPORTENS STRUKTUR:
            1. Sammanfattning (Executive Summary)
            2. Analys av Kvalitetsmål (SKA)
            3. Studieresultat och Närvaro
            4. Elevhälsa och Risker
            5. Incidenter och Trygghet
            6. Slutsatser och Rekommenderade Insatser (Action Items)

            TON OCH STIL:
            - Formell, objektiv och professionell.
            - Rapporten ska skrivas på SVENSKA.
            - Använd Markdown för formatering (rubriker, listor, fetstil).
            - Var konkret: om data visar sjunkande närvaro, analysera vad det innebär och föreslå åtgärder.

            OBS: Svara ENDAST med markdown-innehållet för rapporten.
            """;

    @Transactional
    public ManagementReport generateReport(String title, String period, Long authorId) {
        log.info("Generating management report: {} for period {}", title, period);

        // 1. Gather Data Snapshot
        Map<String, Object> snapshot = gatherDataSnapshot();

        try {
            // 2. Prepare AI Prompt
            String snapshotJson = objectMapper.writeValueAsString(snapshot);
            String prompt = REPORT_SYSTEM_PROMPT + "\n\nDATA FÖR DENNA PERIOD (" + period + "):\n" + snapshotJson;

            // 3. Generate Content with Gemini
            String aiContent = geminiService.generateResponse(prompt);

            // 4. Create and Save Report
            ManagementReport report = new ManagementReport();
            report.setTitle(title);
            report.setPeriod(period);
            report.setContent(aiContent);
            report.setDataSnapshot(snapshotJson);
            report.setStatus("DRAFT");
            report.setAuthor(userRepository.findById(authorId).orElse(null));

            return reportRepository.save(report);

        } catch (Exception e) {
            log.error("Failed to generate management report", e);
            throw new RuntimeException("Report generation failed", e);
        }
    }

    private Map<String, Object> gatherDataSnapshot() {
        Map<String, Object> data = new HashMap<>();

        // Quality Goals
        List<QualityGoal> goals = goalRepository.findByStatus("ACTIVE");
        data.put("ska_goals", goals.stream().map(g -> {
            Map<String, Object> gm = new HashMap<>();
            gm.put("title", g.getTitle());
            gm.put("indicators", indicatorRepository.findByGoalId(g.getId()).stream().map(i -> {
                Map<String, Object> im = new HashMap<>();
                im.put("name", i.getName());
                im.put("type", i.getIndicatorType());
                im.put("target", i.getTargetValue());
                im.put("current", i.getCurrentValue());
                return im;
            }).collect(Collectors.toList()));
            return gm;
        }).collect(Collectors.toList()));

        // High Level KPIs
        data.put("total_students", userRepository.countByRole_Name("STUDENT"));
        data.put("avg_attendance", calculateAverageAttendance());
        data.put("passing_rate", calculatePassingRate());
        data.put("incident_count", incidentReportRepository.count());

        // Risk Statistics
        Map<String, Long> riskStats = new HashMap<>();
        riskStats.put("CRITICAL", riskFlagRepository.countByRiskLevel(StudentRiskFlag.RiskLevel.CRITICAL));
        riskStats.put("HIGH", riskFlagRepository.countByRiskLevel(StudentRiskFlag.RiskLevel.HIGH));
        riskStats.put("MEDIUM", riskFlagRepository.countByRiskLevel(StudentRiskFlag.RiskLevel.MEDIUM));
        data.put("risk_stats", riskStats);

        return data;
    }

    private Double calculateAverageAttendance() {
        long total = attendanceRepository.count();
        if (total == 0)
            return 0.0;
        long present = attendanceRepository.countByIsPresent(true);
        return (double) present / total * 100.0;
    }

    private Double calculatePassingRate() {
        long total = courseResultRepository.count();
        if (total == 0)
            return 0.0;
        long passing = courseResultRepository.findAll().stream()
                .filter(r -> r.getGrade() != null && !r.getGrade().equals("F") && !r.getGrade().equals("-"))
                .count();
        return (double) passing / total * 100.0;
    }

    public List<ManagementReport> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc();
    }

    public ManagementReport getReport(Long id) {
        return reportRepository.findById(id).orElseThrow();
    }

    @Transactional
    public void deleteReport(Long id) {
        reportRepository.deleteById(id);
    }

    @Transactional
    public ManagementReport updateReportStatus(Long id, String status) {
        ManagementReport report = reportRepository.findById(id).orElseThrow();
        report.setStatus(status);
        return reportRepository.save(report);
    }
}
