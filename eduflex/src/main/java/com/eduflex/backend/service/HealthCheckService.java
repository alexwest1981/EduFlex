package com.eduflex.backend.service;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HealthCheckService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public HealthCheckService(UserRepository userRepository, CourseRepository courseRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDataIntegrityReport() {
        Map<String, Object> report = new HashMap<>();

        // 1. Orphaned Students (No Class Group)
        List<User> orphanedStudents = userRepository.findByClassGroupIsNullAndRole_Name("ROLE_STUDENT");
        report.put("orphanedStudents", orphanedStudents.stream()
                .map(u -> Map.of("id", u.getId(), "name", u.getFirstName() + " " + u.getLastName(), "username",
                        u.getUsername()))
                .collect(Collectors.toList()));
        report.put("orphanedStudentCount", orphanedStudents.size());

        // 2. Empty Courses (No Students)
        List<Course> emptyCourses = courseRepository.findCoursesWithNoStudents();
        report.put("emptyCourses", emptyCourses.stream()
                .map(c -> Map.of("id", c.getId(), "name", c.getName(), "code", c.getCourseCode()))
                .collect(Collectors.toList()));
        report.put("emptyCourseCount", emptyCourses.size());

        // 3. System Counters
        report.put("totalUsers", userRepository.count());
        report.put("totalCourses", courseRepository.count());

        // 4. Storage Usage (Mock/Simple check of upload dir)
        long storageBytes = getFolderSize(new File("/app/uploads")); // Docker path
        report.put("storageUsage", storageBytes);
        report.put("storageUsageFormatted", formatSize(storageBytes));

        return report;
    }

    private long getFolderSize(File folder) {
        if (!folder.exists() || !folder.isDirectory())
            return 0;
        long length = 0;
        File[] files = folder.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isFile()) {
                    length += file.length();
                } else {
                    length += getFolderSize(file);
                }
            }
        }
        return length;
    }

    private String formatSize(long v) {
        if (v < 1024)
            return v + " B";
        int z = (63 - Long.numberOfLeadingZeros(v)) / 10;
        return String.format("%.1f %sB", (double) v / (1L << (z * 10)), " KMGTPE".charAt(z));
    }
}
