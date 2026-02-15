package com.eduflex.backend.service;

import com.eduflex.backend.model.Attendance;
import com.eduflex.backend.model.CourseResult;
import com.eduflex.backend.model.Department;
import com.eduflex.backend.model.Program;
import com.eduflex.backend.model.ClassGroup;
import com.eduflex.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@Transactional(readOnly = true)
public class PrincipalDashboardService {

        private final UserRepository userRepository;
        private final CourseRepository courseRepository;
        private final CourseResultRepository courseResultRepository;
        private final AttendanceRepository attendanceRepository;
        private final IncidentReportRepository incidentReportRepository;
        private final CalendarEventRepository calendarEventRepository;
        private final ElevhalsaCaseRepository elevhalsaCaseRepository;
        private final SchoolFeeRepository schoolFeeRepository;
        private final DepartmentRepository departmentRepository;
        private final ProgramRepository programRepository;
        private final ClassGroupRepository classGroupRepository;

        public PrincipalDashboardService(UserRepository userRepository,
                        CourseRepository courseRepository,
                        CourseResultRepository courseResultRepository,
                        AttendanceRepository attendanceRepository,
                        IncidentReportRepository incidentReportRepository,
                        CalendarEventRepository calendarEventRepository,
                        ElevhalsaCaseRepository elevhalsaCaseRepository,
                        SchoolFeeRepository schoolFeeRepository,
                        DepartmentRepository departmentRepository,
                        ProgramRepository programRepository,
                        ClassGroupRepository classGroupRepository) {
                this.userRepository = userRepository;
                this.courseRepository = courseRepository;
                this.courseResultRepository = courseResultRepository;
                this.attendanceRepository = attendanceRepository;
                this.incidentReportRepository = incidentReportRepository;
                this.calendarEventRepository = calendarEventRepository;
                this.elevhalsaCaseRepository = elevhalsaCaseRepository;
                this.schoolFeeRepository = schoolFeeRepository;
                this.departmentRepository = departmentRepository;
                this.programRepository = programRepository;
                this.classGroupRepository = classGroupRepository;
        }

        public Map<String, Object> getSchoolMetrics() {
                Map<String, Object> metrics = new HashMap<>();

                // 1. Närvaro idag (Simplified: % of present in today's events)
                long totalStudentsCount = userRepository.findByRole_Name("STUDENT").size();
                long totalAttendance = attendanceRepository.count();
                long presentCount = attendanceRepository.findAll().stream().filter(Attendance::isPresent).count();

                // If no attendance records exist, we use total students as denominator to show
                // "0/8" instead of "0/0"
                long attendanceExpected = totalAttendance == 0 ? totalStudentsCount : totalAttendance;
                long attendancePercentage = attendanceExpected == 0 ? 0 : (presentCount * 100 / attendanceExpected);

                metrics.put("attendancePercentage", attendancePercentage);
                metrics.put("totalAttendanceExpected", attendanceExpected);
                metrics.put("presentCount", presentCount);

                // 2. Kritiska alerts (Incidenter + Obemannade lektioner)
                metrics.put("activeIncidents",
                                incidentReportRepository.countByStatusNot(
                                                com.eduflex.backend.model.IncidentReport.Status.CLOSED));
                metrics.put("unmannedLessons", calendarEventRepository.countByIsUnmanned(true));

                // 3. Kunskapsstatus (Betygs-progress)
                long totalResults = courseResultRepository.count();
                long completedResults = courseResultRepository
                                .countByStatus(com.eduflex.backend.model.CourseResult.Status.PASSED);
                metrics.put("gradingProgressPercentage",
                                totalResults == 0 ? 0 : (completedResults * 100 / totalResults));
                metrics.put("npRiskCount", courseResultRepository
                                .countByStatus(com.eduflex.backend.model.CourseResult.Status.FAILED));

                // 4. Personal-status (sjukfrånvaro hanteras via staffStatus)
                long totalTeachers = userRepository.findByRole_Name("TEACHER").size();
                long totalAdmins = userRepository.findByRole_Name("ADMIN").size();
                long totalStaff = totalTeachers + totalAdmins;

                long sickTeachers = userRepository.countByRole_NameAndStaffStatus("TEACHER",
                                com.eduflex.backend.model.User.StaffStatus.SICK);
                long sickAdmins = userRepository.countByRole_NameAndStaffStatus("ADMIN",
                                com.eduflex.backend.model.User.StaffStatus.SICK);
                long sickStaff = sickTeachers + sickAdmins;

                metrics.put("staffManningPercentage",
                                totalStaff == 0 ? 100 : ((totalStaff - sickStaff) * 100 / totalStaff));
                metrics.put("sickStaffCount", sickStaff);

                // 5. Betygstrender (Higher grades % A-C)
                long highGrades = courseResultRepository.countByGradeIn(List.of("A", "B", "C"));
                metrics.put("gradesACPercentage", totalResults == 0 ? 0 : (highGrades * 100 / totalResults));

                // 6. Elevhälsa
                metrics.put("openHealthCases",
                                elevhalsaCaseRepository
                                                .countByStatus(com.eduflex.backend.model.ElevhalsaCase.Status.OPEN));

                // 7. Engagemang (Simplified activity check)
                // Count unique logins in the last 24 hours
                LocalDateTime oneDayAgo = LocalDateTime.now().minus(1, ChronoUnit.DAYS);
                long activeUsersLast24h = userRepository.countByLastLoginAfter(oneDayAgo);
                metrics.put("avgLoginsPerDay", activeUsersLast24h);

                // 8. Ekonomi
                long unpaidFees = schoolFeeRepository.countByIsPaid(false);
                long totalFees = schoolFeeRepository.count();
                metrics.put("unpaidFeesCount", unpaidFees);
                metrics.put("paymentPercentage", totalFees == 0 ? 100 : ((totalFees - unpaidFees) * 100 / totalFees));

                // 9. Total Students
                long totalStudents = userRepository.findByRole_Name("STUDENT").size();
                metrics.put("totalStudents", totalStudents);

                metrics.put("fWarningCount", courseResultRepository
                                .countByStatus(com.eduflex.backend.model.CourseResult.Status.FAILED));

                // 10. Departments Structure
                List<Department> departments = departmentRepository.findAll();
                List<Map<String, Object>> deptData = departments.stream().map(dept -> {
                        Map<String, Object> d = new HashMap<>();
                        d.put("name", dept.getName());

                        List<Program> programs = programRepository.findByDepartment_Id(dept.getId());
                        d.put("programCount", programs.size());

                        long studentCount = 0;
                        for (Program p : programs) {
                                List<ClassGroup> classes = classGroupRepository.findByProgram_Id(p.getId());
                                for (ClassGroup c : classes) {
                                        studentCount += userRepository.countByClassGroup_Id(c.getId());
                                }
                        }
                        d.put("studentCount", studentCount);
                        return d;
                }).collect(Collectors.toList());

                metrics.put("departments", deptData);

                // 11. Trend Data (Bara live data - Aktivitet senaste 7 dagarna)
                java.util.List<Integer> trendData = new java.util.ArrayList<>();
                LocalDateTime now = LocalDateTime.now();
                for (int i = 6; i >= 0; i--) {
                        LocalDateTime start = now.minus(i + 1, ChronoUnit.DAYS);
                        // This is a bit simplified since countByLastActiveAfter doesn't take 'before'
                        // But for a rough trend of active users per day:
                        long activeInRange = userRepository.countByLastActiveAfter(start);
                        // Ideally we'd have a daily activity table, but this shows "recency trend"
                        trendData.add((int) activeInRange);
                }
                metrics.put("trendData", trendData);

                return metrics;
        }
}
