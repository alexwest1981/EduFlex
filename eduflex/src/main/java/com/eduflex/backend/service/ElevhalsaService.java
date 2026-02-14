package com.eduflex.backend.service;

import com.eduflex.backend.model.ElevhalsaCase;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.ElevhalsaCaseRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.repository.AttendanceRepository;
import com.eduflex.backend.repository.CourseResultRepository;
import com.eduflex.backend.repository.ClassWellbeingSurveyRepository;
import com.eduflex.backend.repository.SurveyAnswerRepository;
import com.eduflex.backend.repository.ElevhalsaJournalEntryRepository;
import com.eduflex.backend.repository.ElevhalsaBookingRepository;
import com.eduflex.backend.model.ElevhalsaJournalEntry;
import com.eduflex.backend.model.ElevhalsaBooking;
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

    @Autowired
    private SurveyAnswerRepository surveyAnswerRepository;

    @Autowired
    private ElevhalsaJournalEntryRepository journalEntryRepository;

    @Autowired
    private ElevhalsaBookingRepository bookingRepository;

    public ElevhalsaJournalEntry addJournalEntry(Long caseId, User author, String content, String visibility) {
        ElevhalsaCase eCase = caseRepository.findById(caseId).orElseThrow(() -> new RuntimeException("Case not found"));

        ElevhalsaJournalEntry entry = new ElevhalsaJournalEntry();
        entry.setElevhalsaCase(eCase);
        entry.setAuthor(author);
        entry.setContent(content);
        entry.setVisibilityLevel(ElevhalsaJournalEntry.VisibilityLevel.valueOf(visibility));

        return journalEntryRepository.save(entry);
    }

    public List<ElevhalsaJournalEntry> getCaseJournal(Long caseId, User requestor) {
        List<ElevhalsaJournalEntry> allEntries = journalEntryRepository
                .findByElevhalsaCaseIdOrderByCreatedAtAsc(caseId);

        // Strict filtering based on role
        boolean isStaff = requestor.getRole().getName().contains("ADMIN") ||
                requestor.getRole().getName().contains("REKTOR") ||
                requestor.getRole().getName().contains("HALSOTEAM");

        if (isStaff) {
            return allEntries;
        } else {
            // Student/Guardian can ONLY see SHARED entries
            return allEntries.stream()
                    .filter(entry -> entry.getVisibilityLevel() == ElevhalsaJournalEntry.VisibilityLevel.SHARED ||
                            entry.getVisibilityLevel() == ElevhalsaJournalEntry.VisibilityLevel.PUBLIC)
                    .toList();
        }
    }

    public ElevhalsaBooking createBooking(Long studentId, Long staffId, LocalDateTime start, LocalDateTime end,
            String type, String notes) {
        User student = userRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found"));
        User staff = staffId != null ? userRepository.findById(staffId).orElse(null) : null;

        ElevhalsaBooking booking = new ElevhalsaBooking();
        booking.setStudent(student);
        booking.setStaffMember(staff);
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setType(ElevhalsaBooking.BookingType.valueOf(type));
        booking.setNotes(notes);

        return bookingRepository.save(booking);
    }

    public List<ElevhalsaBooking> getBookingsForStaff(Long staffId) {
        return bookingRepository.findByStaffMemberIdOrderByStartTimeAsc(staffId);
    }

    public List<ElevhalsaBooking> getBookingsForStudent(Long studentId) {
        return bookingRepository.findByStudentIdOrderByStartTimeAsc(studentId);
    }

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
        // Try new system first, fallback to old if no data
        Double avgRating = surveyAnswerRepository.getOverallAverageRating();
        if (avgRating == null) {
            avgRating = surveyRepository.getOverallAverageRating();
        }

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

    public Map<String, Object> getWellbeingDrilldown() {
        Map<String, Object> drilldown = new HashMap<>();

        // History: last 6 months
        List<Map<String, Object>> rawMonthly = surveyAnswerRepository.getMonthlyAverageRatings();
        List<Map<String, Object>> monthly = new ArrayList<>();
        for (Map<String, Object> raw : rawMonthly) {
            Map<String, Object> m = new HashMap<>(raw);
            Double avg = (Double) m.get("average");
            m.put("index", avg != null ? (int) Math.round(avg / 5.0 * 100) : 0);
            monthly.add(m);
        }
        drilldown.put("history", monthly);

        // Class distribution
        List<Map<String, Object>> rawClassWise = surveyAnswerRepository.getClassAverageRatings();
        List<Map<String, Object>> classWise = new ArrayList<>();
        for (Map<String, Object> raw : rawClassWise) {
            Map<String, Object> m = new HashMap<>(raw);
            Double avg = (Double) m.get("average");
            m.put("index", avg != null ? (int) Math.round(avg / 5.0 * 100) : 0);
            classWise.add(m);
        }
        drilldown.put("classDistribution", classWise);

        return drilldown;
    }
}
