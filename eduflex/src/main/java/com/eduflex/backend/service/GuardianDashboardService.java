package com.eduflex.backend.service;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class GuardianDashboardService {

        private final GuardianChildLinkRepository guardianChildLinkRepository;
        private final AttendanceRepository attendanceRepository;
        private final CourseResultRepository courseResultRepository;
        private final AssignmentRepository assignmentRepository;
        private final CalendarEventRepository calendarEventRepository;
        private final UserRepository userRepository;

        public GuardianDashboardService(
                        GuardianChildLinkRepository guardianChildLinkRepository,
                        AttendanceRepository attendanceRepository,
                        CourseResultRepository courseResultRepository,
                        AssignmentRepository assignmentRepository,
                        CalendarEventRepository calendarEventRepository,
                        UserRepository userRepository) {
                this.guardianChildLinkRepository = guardianChildLinkRepository;
                this.attendanceRepository = attendanceRepository;
                this.courseResultRepository = courseResultRepository;
                this.assignmentRepository = assignmentRepository;
                this.calendarEventRepository = calendarEventRepository;
                this.userRepository = userRepository;
        }

        public List<User> getChildren(User guardian) {
                return guardianChildLinkRepository.findByGuardian(guardian)
                                .stream()
                                .map(GuardianChildLink::getStudent)
                                .collect(Collectors.toList());
        }

        public Map<String, Object> getChildDashboardMetrics(User child) {
                Map<String, Object> metrics = new HashMap<>();

                // 1. Attendance Today
                LocalDate today = LocalDate.now();
                List<Attendance> todayAttendance = attendanceRepository.findByStudentIdAndDate(child.getId(), today);
                long presentCount = todayAttendance.stream().filter(Attendance::isPresent).count();
                long totalRecords = todayAttendance.size();

                metrics.put("attendancePercentage", totalRecords == 0 ? 0 : (presentCount * 100 / totalRecords));
                metrics.put("presentCount", presentCount);
                metrics.put("totalRecords", totalRecords);
                metrics.put("attendanceStatus",
                                totalRecords == 0 ? "NONE" : (presentCount == totalRecords ? "PRESENT" : "ABSENT"));

                // 2. Upcoming Assignments (Next 7 days)
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime nextWeek = now.plusDays(7);
                // Simplified: Fetch all for student or just filter globally for now
                // In a real scenario, we'd filter by child's courses
                List<Assignment> upcomingAssignments = assignmentRepository.findAll().stream()
                                .filter(a -> a.getDueDate() != null && a.getDueDate().isAfter(now)
                                                && a.getDueDate().isBefore(nextWeek))
                                .collect(Collectors.toList());
                metrics.put("upcomingAssignmentsCount", upcomingAssignments.size());

                // 3. Recent Results (Grades)
                List<CourseResult> recentResults = courseResultRepository.findByStudentId(child.getId());
                metrics.put("recentResults", recentResults.stream()
                                .sorted(Comparator.comparing(CourseResult::getGradedAt,
                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .limit(5)
                                .collect(Collectors.toList()));

                // 4. Today's Schedule
                LocalDateTime startOfDay = today.atStartOfDay();
                LocalDateTime endOfDay = today.atTime(23, 59, 59);
                List<CalendarEvent> todaySchedule = calendarEventRepository.findByAttendeeIdAndStartTimeBetween(
                                child.getId(),
                                startOfDay, endOfDay);
                metrics.put("todaySchedule", todaySchedule);
                metrics.put("todayScheduleCount", todaySchedule.size());

                CalendarEvent nextLesson = todaySchedule.stream()
                                .filter(e -> e.getStartTime().isAfter(now))
                                .findFirst()
                                .orElse(null);
                metrics.put("nextLesson", nextLesson);

                return metrics;
        }

        public List<User> getAllGuardians() {
                return userRepository.findByRole_Name("GUARDIAN");
        }

        @Transactional
        public void linkChild(Long guardianId, Long studentId) {
                User guardian = userRepository.findById(guardianId)
                                .orElseThrow(() -> new RuntimeException("Vårdnadshavare hittades inte"));
                User student = userRepository.findById(studentId)
                                .orElseThrow(() -> new RuntimeException("Elev hittades inte"));

                // Check for existing link
                List<GuardianChildLink> existing = guardianChildLinkRepository.findByGuardian(guardian);
                boolean alreadyLinked = existing.stream().anyMatch(l -> l.getStudent().getId().equals(studentId));

                if (alreadyLinked) {
                        return; // Duplicate ignored
                }

                GuardianChildLink link = new GuardianChildLink();
                link.setGuardian(guardian);
                link.setStudent(student);
                link.setRelationshipType("PARENT");
                guardianChildLinkRepository.save(link);
        }

        @Transactional
        public void unlinkChild(Long linkId) {
                guardianChildLinkRepository.deleteById(linkId);
        }

        public List<GuardianChildLink> getGuardianLinks(User guardian) {
                return guardianChildLinkRepository.findByGuardian(guardian);
        }
}
