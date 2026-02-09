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

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CourseResultRepository courseResultRepository;

    public PrincipalDashboardService(UserRepository userRepository,
                                     CourseRepository courseRepository,
                                     CourseResultRepository courseResultRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.courseResultRepository = courseResultRepository;
    }

    public Map<String, Object> getSchoolMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        long totalStudents = userRepository.count(); // Simplified for now
        long totalCourses = courseRepository.count();
        
        // F-warnings: Students with at least one FAILED result
        long fWarnings = courseResultRepository.findAll().stream()
                .filter(r -> r.getStatus() == CourseResult.Status.FAILED)
                .count();

        // Grading progress: PENDING vs PASSED/FAILED
        long pendingGrades = courseResultRepository.findAll().stream()
                .filter(r -> r.getStatus() == CourseResult.Status.PENDING)
                .count();

        metrics.put("totalStudents", totalStudents);
        metrics.put("totalCourses", totalCourses);
        metrics.put("fWarnings", fWarnings);
        metrics.put("pendingGrades", pendingGrades);
        
        // Add more complex aggregations as needed (e.g., by Department)

        return metrics;
    }
}
