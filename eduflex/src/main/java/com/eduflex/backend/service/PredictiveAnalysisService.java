package com.eduflex.backend.service;

import com.eduflex.backend.model.StudentRiskFlag;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.*;
import com.eduflex.backend.service.ai.GeminiService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PredictiveAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(PredictiveAnalysisService.class);

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final CourseResultRepository courseResultRepository;
    private final SubmissionRepository submissionRepository;
    private final StudentActivityLogRepository activityLogRepository;
    private final StudentRiskFlagRepository riskFlagRepository;
    private final SickLeaveReportRepository sickLeaveRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public PredictiveAnalysisService(UserRepository userRepository,
            AttendanceRepository attendanceRepository,
            CourseResultRepository courseResultRepository,
            SubmissionRepository submissionRepository,
            StudentActivityLogRepository activityLogRepository,
            StudentRiskFlagRepository riskFlagRepository,
            SickLeaveReportRepository sickLeaveRepository,
            GeminiService geminiService,
            ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
        this.courseResultRepository = courseResultRepository;
        this.submissionRepository = submissionRepository;
        this.activityLogRepository = activityLogRepository;
        this.riskFlagRepository = riskFlagRepository;
        this.sickLeaveRepository = sickLeaveRepository;
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    private static final String ANALYSIS_SYSTEM_PROMPT = """
            Du är en expert på pedagogisk analys och elevhälsa.
            Din uppgift är att analysera studentdata från ett LMS och identifiera riskfaktorer för avhopp eller misslyckade studier.

            RISKNIVÅER:
            - LOW: Inga direkta problem.
            - MEDIUM: Vissa oroväckande mönster (t.ex. begynnande ogiltig frånvaro).
            - HIGH: Tydliga problem som kräver intervention.
            - CRITICAL: Akut risk (t.ex. total frånvaro, inga inlämningar).

            KATEGORIER:
            - ATTENDANCE: Frånvaro, sjukanmälningar.
            - PERFORMANCE: Betygstrender, sena inlämningar.
            - ENGAGEMENT: Inloggningsmönster, aktivitet i kurser.
            - GENERAL: En kombination av ovanstående.

            FORMAT:
            Du MÅSTE svara med giltig JSON (ingen markdown):
            {
              "riskLevel": "HIGH",
              "category": "PERFORMANCE",
              "aiReasoning": "Studenten har missat de 3 senaste inlämningarna och har en sjunkande betygstrend i matematik.",
              "aiSuggestions": "Boka ett stödsamtal med studenten och erbjud extra handledning i matematik."
            }
            """;

    @Transactional
    public void analyzeAllStudents() {
        List<User> students = userRepository.findByRole_Name("STUDENT");
        logger.info("Starting batch risk analysis for {} students", students.size());
        for (User student : students) {
            try {
                analyzeStudentRisk(student.getId());
            } catch (Exception e) {
                logger.error("Failed to analyze risk for student {}: {}", student.getId(), e.getMessage());
            }
        }
    }

    @Transactional
    public StudentRiskFlag analyzeStudentRisk(Long studentId) {
        User student = userRepository.findById(studentId).orElseThrow();

        // Gather data
        Map<String, Object> data = new HashMap<>();
        data.put("fullName", student.getFullName());
        data.put("totalAttendance", attendanceRepository.countByStudentId(studentId));
        data.put("absentCount", attendanceRepository.countByStudentIdAndIsPresent(studentId, false));
        data.put("submissionsCount", submissionRepository.findByStudentId(studentId).size());
        data.put("results", courseResultRepository.findByStudentId(studentId));
        data.put("sickLeaveCount", sickLeaveRepository.findByUserIdOrderByReportedAtDesc(studentId).size());
        data.put("lastLogin", student.getLastLogin());
        data.put("loginCount", student.getLoginCount());

        // Add recent activity summary
        List<?> recentActivity = activityLogRepository.findByUserIdOrderByTimestampDesc(studentId);
        data.put("recentActivityCount", recentActivity.size());

        String prompt = ANALYSIS_SYSTEM_PROMPT + "\n\nDATA FÖR ANALYS:\n" + data.toString();

        try {
            String jsonResponse = geminiService.generateJsonContent(prompt);
            Map<String, Object> result = objectMapper.readValue(jsonResponse, new TypeReference<>() {
            });

            StudentRiskFlag flag = riskFlagRepository.findTopByStudentIdOrderByLastCalculatedDesc(studentId)
                    .orElse(new StudentRiskFlag());

            flag.setStudent(student);
            flag.setRiskLevel(StudentRiskFlag.RiskLevel.valueOf((String) result.get("riskLevel")));
            flag.setCategory((String) result.get("category"));
            flag.setAiReasoning((String) result.get("aiReasoning"));
            flag.setAiSuggestions((String) result.get("aiSuggestions"));
            flag.setLastCalculated(LocalDateTime.now());

            return riskFlagRepository.save(flag);

        } catch (Exception e) {
            logger.error("Error in AI risk analysis for student {}: {}", studentId, e.getMessage());
            throw new RuntimeException("AI Analysis failed", e);
        }
    }

    public List<StudentRiskFlag> getHighRiskStudents() {
        return riskFlagRepository.findHighRiskFlags();
    }

    public List<StudentRiskFlag> getHighRiskStudentsForMentor(Long mentorId) {
        return riskFlagRepository.findHighRiskFlagsForMentor(mentorId);
    }
}
