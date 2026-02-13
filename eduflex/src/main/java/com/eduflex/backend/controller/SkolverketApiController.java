package com.eduflex.backend.controller;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.SkolverketApiClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/skolverket/api")
public class SkolverketApiController {

    private final SkolverketApiClientService skolverketApiService;
    private final com.eduflex.backend.service.SkolverketCourseService skolverketCourseService;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Autowired
    public SkolverketApiController(SkolverketApiClientService skolverketApiService,
            com.eduflex.backend.service.SkolverketCourseService skolverketCourseService,
            CourseRepository courseRepository,
            UserRepository userRepository) {
        this.skolverketApiService = skolverketApiService;
        this.skolverketCourseService = skolverketCourseService;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    private String generateUniqueSlug(String name) {
        if (name == null || name.isBlank()) {
            return UUID.randomUUID().toString().substring(0, 8);
        }
        String baseSlug = name.toLowerCase()
                .replace("å", "a").replace("ä", "a").replace("ö", "o")
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        if (baseSlug.isBlank()) {
            return UUID.randomUUID().toString().substring(0, 8);
        }
        String slug = baseSlug;
        int count = 1;
        while (courseRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + count++;
        }
        return slug;
    }

    @GetMapping("/subjects")
    public ResponseEntity<Object> getSubjects() {
        return ResponseEntity.ok(skolverketApiService.getAllSubjects());
    }

    @GetMapping("/subjects/{code}")
    public ResponseEntity<Object> getSubject(@PathVariable String code) {
        return ResponseEntity.ok(skolverketApiService.getSubject(code));
    }

    @PostMapping("/import")
    @Transactional
    public ResponseEntity<?> importCourse(@RequestBody Map<String, Object> courseData) {
        try {
            String code = (String) courseData.get("code"); // Subject code e.g. "ADI"
            String name = (String) courseData.get("name");
            String description = (String) courseData.get("description");

            // Optional fields
            Integer teacherId = courseData.get("teacherId") != null ? ((Number) courseData.get("teacherId")).intValue()
                    : null;
            String startDate = (String) courseData.get("startDate");
            String endDate = (String) courseData.get("endDate");

            if (code == null || name == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing code or name"));
            }

            Optional<Course> existing = courseRepository.findByCourseCode(code);
            if (existing.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course already exists: " + code));
            }

            Course course = new Course();
            course.setCourseCode(code);
            course.setName(name);
            course.setDescription(description);
            course.setCategory("Skolverket Import");
            course.setOpen(true);

            // Generate unique slug (critical — slug has unique constraint)
            course.setSlug(generateUniqueSlug(name));

            if (startDate != null)
                course.setStartDate(startDate);
            if (endDate != null)
                course.setEndDate(endDate);

            if (teacherId != null) {
                Optional<User> teacherOpt = userRepository.findById(Long.valueOf(teacherId));
                if (teacherOpt.isPresent()) {
                    course.setTeacher(teacherOpt.get());
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "Teacher not found with ID: " + teacherId));
                }
            }

            // --- RICH DATA FETCH & LINKING ---
            try {
                skolverketCourseService.syncFromSkolverket(code);

                // Link the EduFlex Course to the SkolverketCourse
                skolverketCourseService.getCourseByCode(code); // Verify it exists
                com.eduflex.backend.model.SkolverketCourse skCourse = skolverketCourseService.getCourseByCode(code);
                if (skCourse != null) {
                    course.setSkolverketCourse(skCourse);
                    if (skCourse.getDescription() != null && !skCourse.getDescription().isEmpty()) {
                        course.setDescription(skCourse.getDescription());
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to fetch/sync Skolverket rich data: " + e.getMessage());
            }

            courseRepository.save(course);
            return ResponseEntity.ok(Map.of("success", true, "id", course.getId()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sync-all")
    @Transactional
    public ResponseEntity<?> syncAll() {
        List<com.eduflex.backend.model.SkolverketCourse> allCourses = skolverketCourseService.getAllCourses();
        int count = 0;
        int failed = 0;

        for (com.eduflex.backend.model.SkolverketCourse sc : allCourses) {
            try {
                // We only sync subjects (short codes) or first-level courses that might have
                // children
                // In this system, skolverket_courses table contains both.
                // Syncing individual children is fine too.
                skolverketCourseService.syncFromSkolverket(sc.getCourseCode());
                count++;
            } catch (Exception e) {
                failed++;
            }
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "synced", count,
                "failed", failed,
                "message", "Sync completed"));
    }

    @PostMapping("/sync/{courseCode}")
    @Transactional
    public ResponseEntity<?> syncOne(@PathVariable String courseCode) {
        try {
            skolverketCourseService.syncFromSkolverket(courseCode);
            return ResponseEntity.ok(Map.of("success", true, "message", "Course synced successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
