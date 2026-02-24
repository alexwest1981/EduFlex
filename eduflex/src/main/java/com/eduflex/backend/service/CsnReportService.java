package com.eduflex.backend.service;

import com.eduflex.backend.dto.CsnAttendanceDto;
import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.AttendanceRepository;
import com.eduflex.backend.repository.CalendarEventRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.CourseResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Genererar CSN-rapporter med fullständig närvaro- och aktivitetsdata per elev.
 * Varje export loggas via GdprAuditService för GDPR-efterlevnad.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CsnReportService {

    private final AttendanceRepository attendanceRepository;
    private final CalendarEventRepository eventRepository;
    private final CourseRepository courseRepository;
    private final CourseResultRepository courseResultRepository;
    private final GdprAuditService gdprAuditService;

    /**
     * Genererar CSN-rapport för en enskild kurs inom ett givet datumintervall.
     * Varje rad inkluderar närvaro, aktivitet och kursbetyg per elev.
     */
    public List<CsnAttendanceDto> generateCsnAttendanceReport(Long courseId, LocalDateTime start, LocalDateTime end) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Set<User> students = course.getStudents();
        List<CalendarEvent> lessons = eventRepository.findByCourseIdAndStartTimeBetweenOrderByStartTimeAsc(courseId,
                start, end);

        log.info("Generating CSN report for course: {}, lessons: {}, students: {}", course.getName(),
                lessons.size(), students.size());

        List<CsnAttendanceDto> report = new ArrayList<>();

        for (User student : students) {
            report.add(buildStudentRow(student, course, lessons));
        }

        // GDPR: logga att vi exporterar personuppgifter
        gdprAuditService.logBulkExport("CSN_Attendance_Report",
                String.format("Course: %s, Period: %s to %s, Students: %d",
                        course.getName(), start, end, students.size()));

        return report;
    }

    /**
     * Genererar CSN-rapport för flera kurser samtidigt (bulk-export).
     * Perfekt för terminsrapportering till CSN.
     */
    public List<CsnAttendanceDto> generateBulkCsnReport(List<Long> courseIds, LocalDateTime start, LocalDateTime end) {
        List<CsnAttendanceDto> report = new ArrayList<>();

        for (Long courseId : courseIds) {
            try {
                report.addAll(generateCsnAttendanceReport(courseId, start, end));
            } catch (Exception e) {
                log.warn("Kunde inte generera rapport för kurs {}: {}", courseId, e.getMessage());
            }
        }

        log.info("Bulk CSN report generated: {} courses, {} total rows", courseIds.size(), report.size());
        return report;
    }

    /**
     * Bygger en fullständig rad för en student i CSN-rapporten.
     * Inkluderar närvaro, senaste aktivitet och kursbetyg.
     */
    private CsnAttendanceDto buildStudentRow(User student, Course course, List<CalendarEvent> lessons) {
        int total = lessons.size();
        int attended = 0;

        for (CalendarEvent lesson : lessons) {
            Attendance att = attendanceRepository.findByEventIdAndStudentId(lesson.getId(), student.getId());
            if (att != null && att.isPresent()) {
                attended++;
            }
        }

        double percentage = total > 0 ? (double) attended / total * 100 : 0;

        // Hämta kursresultat om det finns
        String resultStatus = "EJ_BEDÖMD";
        Optional<CourseResult> courseResult = courseResultRepository
                .findByCourseIdAndStudentId(course.getId(), student.getId());
        if (courseResult.isPresent()) {
            resultStatus = courseResult.get().getStatus().name();
        }

        return CsnAttendanceDto.builder()
                .studentName(student.getFullName())
                .ssn(student.getSsn())
                .courseName(course.getName())
                .courseCode(course.getCourseCode())
                .totalLessons(total)
                .attendedLessons(attended)
                .attendancePercentage(percentage)
                .lastLogin(student.getLastLogin())
                .lastActive(student.getLastActive())
                .activeMinutes(student.getActiveMinutes())
                .courseResult(resultStatus)
                .build();
    }
}
