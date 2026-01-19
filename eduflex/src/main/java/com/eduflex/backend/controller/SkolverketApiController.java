package com.eduflex.backend.controller;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.User;
import com.eduflex.backend.model.SkolverketCourse;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.SkolverketApiClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/skolverket/api")
public class SkolverketApiController {

    private final SkolverketApiClientService skolverketService;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final com.eduflex.backend.repository.SkolverketCourseRepository skolverketCourseRepository;

    @Autowired
    public SkolverketApiController(SkolverketApiClientService skolverketService, CourseRepository courseRepository,
            UserRepository userRepository,
            com.eduflex.backend.repository.SkolverketCourseRepository skolverketCourseRepository) {
        this.skolverketService = skolverketService;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.skolverketCourseRepository = skolverketCourseRepository;
    }

    @GetMapping("/subjects")
    public ResponseEntity<Object> getSubjects() {
        return ResponseEntity.ok(skolverketService.getAllSubjects());
    }

    @GetMapping("/subjects/{code}")
    public ResponseEntity<Object> getSubject(@PathVariable String code) {
        return ResponseEntity.ok(skolverketService.getSubject(code));
    }

    @PostMapping("/import")
    public ResponseEntity<?> importCourse(@RequestBody Map<String, Object> courseData) {
        try {
            String code = (String) courseData.get("code"); // Subject Code e.g. "MATMAT01"
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

            // Set default dates if needed, or leave null

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
                // Fetch full data from Skolverket API again to ensure we have everything
                Object apiResponse = skolverketService.getSubject(code);
                if (apiResponse instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = (Map<String, Object>) apiResponse;
                    @SuppressWarnings("unchecked")
                    Map<String, Object> subjectData = (Map<String, Object>) data.get("subject");

                    if (subjectData != null) {
                        // Check if SkolverketCourse already exists
                        Optional<SkolverketCourse> skCourseOpt = skolverketCourseRepository.findByCourseCode(code);
                        SkolverketCourse skCourse;

                        if (skCourseOpt.isPresent()) {
                            skCourse = skCourseOpt.get();
                        } else {
                            skCourse = new SkolverketCourse();
                            skCourse.setCourseCode(code);
                            skCourse.setCourseName(name);
                            skCourse.setSubject((String) subjectData.get("typeOfSyllabus") + " - " + code); // Simplified
                                                                                                            // subject
                            skCourse.setPoints(100); // Default, API might provide it?
                        }

                        // Map Rich Fields
                        skCourse.setDescription((String) subjectData.get("description"));
                        skCourse.setSubjectPurpose((String) subjectData.get("purpose")); // "purpose" field in JSON
                        // skCourse.setObjectives(...); // API structure varies, "centralContent"?

                        skolverketCourseRepository.save(skCourse);
                        course.setSkolverketCourse(skCourse);

                        // Also update Course description to matched rich description if available
                        if (skCourse.getDescription() != null && !skCourse.getDescription().isEmpty()) {
                            course.setDescription(skCourse.getDescription());
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to fetch/save Skolverket rich data: " + e.getMessage());
                // Non-blocking failure, continue importing the course itself
            }

            courseRepository.save(course);

            return ResponseEntity.ok(Map.of("success", true, "id", course.getId()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
