package com.eduflex.backend.service;

import com.eduflex.backend.dto.CsnAttendanceDto;
import com.eduflex.backend.model.Attendance;
import com.eduflex.backend.model.CalendarEvent;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.AttendanceRepository;
import com.eduflex.backend.repository.CalendarEventRepository;
import com.eduflex.backend.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class CsnReportService {

    private final AttendanceRepository attendanceRepository;
    private final CalendarEventRepository eventRepository;
    private final CourseRepository courseRepository;
    private final GdprAuditService gdprAuditService;

    public List<CsnAttendanceDto> generateCsnAttendanceReport(Long courseId, LocalDateTime start, LocalDateTime end) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Set<User> students = course.getStudents();
        List<CalendarEvent> lessons = eventRepository.findByCourseIdAndStartTimeBetweenOrderByStartTimeAsc(courseId,
                start, end);

        log.info("Generating CSN report for course: {}, lessons count: {}, students count: {}", course.getName(),
                lessons.size(), students.size());

        List<CsnAttendanceDto> report = new ArrayList<>();

        for (User student : students) {
            int total = lessons.size();
            int attended = 0;

            for (CalendarEvent lesson : lessons) {
                Attendance att = attendanceRepository.findByEventIdAndStudentId(lesson.getId(), student.getId());
                if (att != null && att.isPresent()) {
                    attended++;
                }
            }

            double percentage = total > 0 ? (double) attended / total * 100 : 0;

            report.add(CsnAttendanceDto.builder()
                    .studentName(student.getFullName())
                    .ssn(student.getSsn())
                    .courseName(course.getName())
                    .totalLessons(total)
                    .attendedLessons(attended)
                    .attendancePercentage(percentage)
                    .build());
        }

        // Log bulk export for GDPR compliance
        gdprAuditService.logBulkExport("CSN_Attendance_Report",
                String.format("Course: %s, Start: %s, End: %s", course.getName(), start, end));

        return report;
    }
}
