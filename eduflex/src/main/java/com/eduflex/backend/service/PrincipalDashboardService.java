package com.eduflex.backend.service;

import com.eduflex.backend.model.CourseResult;
import com.eduflex.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class PrincipalDashboardService {

    private final CourseRepository courseRepository;
    private final CourseResultRepository courseResultRepository;
    private final AttendanceRepository attendanceRepository;
    private final IncidentReportRepository incidentReportRepository;
    private final CalendarEventRepository calendarEventRepository;
    private final ElevhalsaCaseRepository elevhalsaCaseRepository;
    private final SchoolFeeRepository schoolFeeRepository;

    public PrincipalDashboardService(UserRepository userRepository,
        this.courseRepository = courseRepository;
        this.courseResultRepository = courseResultRepository;
        this.attendanceRepository = attendanceRepository;
        this.incidentReportRepository = incidentReportRepository;
        this.calendarEventRepository = calendarEventRepository;
        this.elevhalsaCaseRepository = elevhalsaCaseRepository;
        this.schoolFeeRepository = schoolFeeRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> getSchoolMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // 1. Närvaro idag (Simplified: % of present in today's events)
        long totalAttendance = attendanceRepository.count();
        long presentCount = attendanceRepository.findAll().stream().filter(Attendance::isPresent).count();
        metrics.put("attendancePercentage", totalAttendance == 0 ? 100 : (presentCount * 100 / totalAttendance));
        metrics.put("totalAttendanceExpected", totalAttendance);
        metrics.put("presentCount", presentCount);

        // 2. Kritiska alerts (Incidenter + Obemannade lektioner)
        metrics.put("activeIncidents", incidentReportRepository.countByStatusNot(com.eduflex.backend.model.IncidentReport.Status.CLOSED));
        metrics.put("unmannedLessons", calendarEventRepository.countByIsUnmanned(true));

        // 3. Kunskapsstatus (Betygs-progress)
        long totalResults = courseResultRepository.count();
        long completedResults = courseResultRepository.findAll().stream()
                .filter(r -> r.getStatus() == com.eduflex.backend.model.CourseResult.Status.PASSED).count();
        metrics.put("gradingProgressPercentage", totalResults == 0 ? 0 : (completedResults * 100 / totalResults));
        metrics.put("npRiskCount", courseResultRepository.findAll().stream()
                .filter(r -> r.getStatus() == com.eduflex.backend.model.CourseResult.Status.FAILED).count()); 

        // 4. Personal-status
        long totalStaff = userRepository.findByRole_Name("TEACHER").size() + userRepository.findByRole_Name("ADMIN").size();
        long sickStaff = userRepository.findAll().stream()
                .filter(u -> u.getStaffStatus() == com.eduflex.backend.model.User.StaffStatus.SICK).count();
        metrics.put("staffManningPercentage", totalStaff == 0 ? 100 : ((totalStaff - sickStaff) * 100 / totalStaff));
        metrics.put("sickStaffCount", sickStaff);

        // 5. Betygstrender (Higher grades % A-C)
        long highGrades = courseResultRepository.findAll().stream()
                .filter(r -> r.getGrade() != null && (r.getGrade().equals("A") || r.getGrade().equals("B") || r.getGrade().equals("C"))).count();
        metrics.put("gradesACPercentage", totalResults == 0 ? 0 : (highGrades * 100 / totalResults));

        // 6. Elevhälsa
        metrics.put("openHealthCases", elevhalsaCaseRepository.countByStatus(com.eduflex.backend.model.ElevhalsaCase.Status.OPEN));

        // 7. Engagemang (Simplified activity check)
        metrics.put("avgLoginsPerDay", 0); // No login sequence history yet

        // 8. Ekonomi
        long unpaidFees = schoolFeeRepository.countByIsPaid(false);
        long totalFees = schoolFeeRepository.count();
        metrics.put("unpaidFeesCount", unpaidFees);
        metrics.put("paymentPercentage", totalFees == 0 ? 100 : ((totalFees - unpaidFees) * 100 / totalFees));

        metrics.put("totalStudents", userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().getName().equals("STUDENT")).count());
        metrics.put("fWarnings", courseResultRepository.findAll().stream()
                .filter(r -> r.getStatus() == com.eduflex.backend.model.CourseResult.Status.FAILED).count());

        return metrics;
    }
}
