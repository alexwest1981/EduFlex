package com.eduflex.backend.service;

import com.eduflex.backend.model.ElevhalsaCase;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.ElevhalsaCaseRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.repository.AttendanceRepository;
import com.eduflex.backend.repository.CourseResultRepository;
import com.eduflex.backend.repository.ClassWellbeingSurveyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
public class ElevhalsaService {

    @Autowired
    private ElevhalsaCaseRepository caseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private CourseResultRepository resultRepository;

    @Autowired
    private ClassWellbeingSurveyRepository surveyRepository;

    public Map<String, Object> getMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        long activeCases = caseRepository.countByStatus(ElevhalsaCase.Status.OPEN)
                + caseRepository.countByStatus(ElevhalsaCase.Status.IN_PROGRESS);
        metrics.put("activeCases", activeCases);

        // Resolved this month: cases closed since start of current month
        LocalDateTime startOfMonth = LocalDateTime.now()
                .with(TemporalAdjusters.firstDayOfMonth())
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        long resolvedThisMonth = caseRepository.countByStatusAndClosedAtAfter(
                ElevhalsaCase.Status.RESOLVED, startOfMonth)
                + caseRepository.countByStatusAndClosedAtAfter(
                        ElevhalsaCase.Status.CLOSED, startOfMonth);
        metrics.put("resolvedThisMonth", resolvedThisMonth);

        metrics.put("atRiskStudentsCount", getAtRiskStudents().size());

        // Wellbeing index from survey data (1-5 scale → percentage)
        Double avgRating = surveyRepository.getOverallAverageRating();
        int wellbeingIndex = avgRating != null ? (int) Math.round(avgRating / 5.0 * 100) : 0;
        metrics.put("wellbeingIndex", wellbeingIndex);

        return metrics;
    }

    public List<Map<String, Object>> getAtRiskStudents() {
        List<User> students = userRepository.findByRole_Name("ROLE_STUDENT");
        List<Map<String, Object>> risks = new ArrayList<>();

        for (User student : students) {
            double attendanceRate = calculateAttendanceRate(student.getId());
            long fGrades = countLowGrades(student.getId());

            if (attendanceRate < 80.0 || fGrades > 0) {
                Map<String, Object> risk = new HashMap<>();
                risk.put("studentId", student.getId());
                risk.put("name", student.getFullName());
                risk.put("attendance", attendanceRate);
                risk.put("warnings", fGrades);
                risk.put("riskLevel",
                        (attendanceRate < 50.0 || fGrades > 2) ? "HIGH"
                                : (attendanceRate < 70.0) ? "MEDIUM" : "LOW");
                risks.add(risk);
            }
        }
        return risks;
    }

    public List<ElevhalsaCase> getRecentCases() {
        return caseRepository.findTop10ByOrderByCreatedAtDesc();
    }

    private double calculateAttendanceRate(Long studentId) {
        long total = attendanceRepository.countByStudentId(studentId);
        if (total == 0)
            return 100.0;
        long present = attendanceRepository.countByStudentIdAndIsPresent(studentId, true);
        return (double) present / total * 100.0;
    }

    private long countLowGrades(Long studentId) {
        return resultRepository.countByStudentIdAndGrade(studentId, "F");
    }

    public List<ElevhalsaCase> getAllCases() {
        return caseRepository.findAll();
    }

    @Transactional
    public ElevhalsaCase createCase(ElevhalsaCase healthCase) {
        return caseRepository.save(healthCase);
    }
}
