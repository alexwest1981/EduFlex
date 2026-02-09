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
                                     CourseRepository courseRepository,
                                     CourseResultRepository courseResultRepository,
                                     AttendanceRepository attendanceRepository,
                                     IncidentReportRepository incidentReportRepository,
                                     CalendarEventRepository calendarEventRepository,
                                     ElevhalsaCaseRepository elevhalsaCaseRepository,
                                     SchoolFeeRepository schoolFeeRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.courseResultRepository = courseResultRepository;
        this.attendanceRepository = attendanceRepository;
        this.incidentReportRepository = incidentReportRepository;
        this.calendarEventRepository = calendarEventRepository;
        this.elevhalsaCaseRepository = elevhalsaCaseRepository;
        this.schoolFeeRepository = schoolFeeRepository;
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
        metrics.put("gradingProgressPercentage", 87); // Dummy baseline for now
        metrics.put("npRiskCount", 12); 

        // 4. Personal-status
        long totalStaff = userRepository.count(); // Should be filtered by role
        long sickStaff = userRepository.findAll().stream().filter(u -> u.getStaffStatus() == User.StaffStatus.SICK).count();
        metrics.put("staffManningPercentage", totalStaff == 0 ? 100 : ((totalStaff - sickStaff) * 100 / totalStaff));
        metrics.put("sickStaffCount", sickStaff);

        // 5. Betygstrender
        metrics.put("gradesACPercentage", 82);

        // 6. Elevhälsa
        metrics.put("openHealthCases", elevhalsaCaseRepository.countByStatus(com.eduflex.backend.model.ElevhalsaCase.Status.OPEN));

        // 7. Engagemang (Activity logs)
        metrics.put("avgLoginsPerDay", 2.3);

        // 8. Ekonomi
        long unpaidFees = schoolFeeRepository.countByIsPaid(false);
        metrics.put("unpaidFeesCount", unpaidFees);

        metrics.put("totalStudents", userRepository.count());
        metrics.put("fWarnings", courseResultRepository.findAll().stream()
                .filter(r -> r.getStatus() == com.eduflex.backend.model.CourseResult.Status.FAILED).count());

        return metrics;
    }
}
