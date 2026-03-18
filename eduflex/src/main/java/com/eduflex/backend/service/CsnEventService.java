package com.eduflex.backend.service;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CourseEnrollmentDetails;
import com.eduflex.backend.model.CsnEventLog;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseEnrollmentDetailsRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.CsnEventLogRepository;
import com.eduflex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

/**
 * Service for EduFlex CSN Autopilot (ERP+) and Ghosting Radar.
 * Handles automatic mapping to CSN reporting codes (99, 41, 81)
 * and monitoring student activity to prevent unauthorized CSN payouts.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CsnEventService {

    private final CsnEventLogRepository csnEventLogRepository;
    private final CourseEnrollmentDetailsRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final NotificationService notificationService; // Assuming a notification service exists

    public static final String CODE_NOT_STARTED = "81";
    public static final String CODE_DROPOUT = "99";
    public static final String CODE_PACE_CHANGED = "41";

    /**
     * Records a specific CSN event (e.g., when a teacher drops a student manually).
     */
    @Transactional
    public CsnEventLog recordCsnEvent(Long studentId, Long courseId, String eventCode, String description) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        CsnEventLog eventLog = new CsnEventLog();
        eventLog.setStudent(student);
        eventLog.setCourse(course);
        eventLog.setEventCode(eventCode);
        eventLog.setEventDate(LocalDateTime.now());
        eventLog.setDescription(description);
        eventLog.setReportedToCsn(false);

        log.info("CSN Autopilot: Logged event {} for student {} in course {}", eventCode, student.getUsername(),
                course.getCourseCode());
        return csnEventLogRepository.save(eventLog);
    }

    /**
     * Updates study pace and automatically triggers Code 41.
     */
    @Transactional
    public void updateStudyPace(Long studentId, Long courseId, Integer newPace) {
        CourseEnrollmentDetails enrollment = enrollmentRepository.findByCourseIdAndStudentId(courseId, studentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        if (!enrollment.getStudyPacePercentage().equals(newPace)) {
            enrollment.setStudyPacePercentage(newPace);
            enrollmentRepository.save(enrollment);

            recordCsnEvent(studentId, courseId, CODE_PACE_CHANGED,
                    "Studietakt ändrad till " + newPace + "%");
        }
    }

    /**
     * Marks a student as dropped out and triggers Code 99.
     */
    @Transactional
    public void markAsDroppedOut(Long studentId, Long courseId) {
        CourseEnrollmentDetails enrollment = enrollmentRepository.findByCourseIdAndStudentId(courseId, studentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        if (enrollment.getStatus() != CourseEnrollmentDetails.EnrollmentStatus.DROPPED_OUT) {
            enrollment.setStatus(CourseEnrollmentDetails.EnrollmentStatus.DROPPED_OUT);
            enrollmentRepository.save(enrollment);

            recordCsnEvent(studentId, courseId, CODE_DROPOUT, "Avbrott från kurs registrerat.");
        }
    }

    /**
     * Ghosting Radar: Runs daily at 02:00 to check for inactive students.
     * Flags students inactive for 10 days (Yellow) or 20 days (Red).
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void runGhostingRadar() {
        log.info("CSN Ghosting Radar: Starting daily scan of student activity...");
        List<CourseEnrollmentDetails> activeEnrollments = enrollmentRepository
                .findByStatus(CourseEnrollmentDetails.EnrollmentStatus.ACTIVE);
        LocalDateTime now = LocalDateTime.now();

        for (CourseEnrollmentDetails enrollment : activeEnrollments) {
            User student = enrollment.getStudent();
            LocalDateTime lastActive = student.getLastActive() != null ? student.getLastActive()
                    : enrollment.getEnrolledAt();

            long daysInactive = ChronoUnit.DAYS.between(lastActive, now);

            if (daysInactive >= 20) {
                // Red Flag: 20 days inactive. Alert principal/admin for potential CSN Code 99.
                log.warn("GHOSTING RADAR [RED]: Student {} has been inactive for {} days in course {}.",
                        student.getUsername(), daysInactive, enrollment.getCourse().getCourseCode());

                // TODO: Trigger actual admin notification event
                // notificationService.notifyAdmin("CSN Risk: Möljigt dolt avhopp för " +
                // student.getFullName());

            } else if (daysInactive == 10) {
                // Yellow Flag: 10 days inactive. Send AI motivational message to student.
                log.info("GHOSTING RADAR [YELLOW]: Student {} inactive for 10 days. Triggering AI motivation.",
                        student.getUsername());

                // TODO: Trigger EduAI to send a motivational ping
                // aiService.sendMotivationalPing(student);
            }
        }
        log.info("CSN Ghosting Radar: Scan complete.");
    }
}
