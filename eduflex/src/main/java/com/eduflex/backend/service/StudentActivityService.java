package com.eduflex.backend.service;

import com.eduflex.backend.dto.StudentActivityLogDTO;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CourseMaterial;
import com.eduflex.backend.model.StudentActivityLog;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseMaterialRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.StudentActivityLogRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentActivityService {

    private final StudentActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CourseMaterialRepository materialRepository;

    public StudentActivityService(StudentActivityLogRepository activityLogRepository,
            UserRepository userRepository,
            CourseRepository courseRepository,
            CourseMaterialRepository materialRepository) {
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.materialRepository = materialRepository;
    }

    @Transactional
    public void logActivity(Long userId, Long courseId, Long materialId, StudentActivityLog.ActivityType type,
            String details) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));

        CourseMaterial material = null;
        if (materialId != null) {
            material = materialRepository.findById(materialId).orElse(null);
        }

        StudentActivityLog log = new StudentActivityLog(user, course, material, type, details);
        activityLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<StudentActivityLogDTO> getCourseLogs(Long courseId) {
        return activityLogRepository.findByCourseIdOrderByTimestampDesc(courseId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StudentActivityLogDTO> getStudentLogs(Long courseId, Long userId) {
        return activityLogRepository.findByCourseIdAndUserIdOrderByTimestampDesc(courseId, userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private StudentActivityLogDTO convertToDTO(StudentActivityLog log) {
        return new StudentActivityLogDTO(
                log.getId(),
                log.getUser().getId(),
                log.getUser().getFirstName() + " " + log.getUser().getLastName(),
                log.getActivityType().name(),
                log.getDetails(),
                log.getTimestamp(),
                log.getMaterial() != null ? log.getMaterial().getTitle() : null);
    }
}
