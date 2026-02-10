package com.eduflex.backend.controller;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.User;
import com.eduflex.backend.model.SkolverketCourse;
import com.eduflex.backend.model.SkolverketGradingCriteria;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.SkolverketGradingCriteriaRepository;
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

    private final SkolverketApiClientService skolverketService;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final com.eduflex.backend.repository.SkolverketCourseRepository skolverketCourseRepository;
    private final SkolverketGradingCriteriaRepository gradingCriteriaRepository;

    @Autowired
    public SkolverketApiController(SkolverketApiClientService skolverketService, CourseRepository courseRepository,
            UserRepository userRepository,
            com.eduflex.backend.repository.SkolverketCourseRepository skolverketCourseRepository,
            SkolverketGradingCriteriaRepository gradingCriteriaRepository) {
        this.skolverketService = skolverketService;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.skolverketCourseRepository = skolverketCourseRepository;
        this.gradingCriteriaRepository = gradingCriteriaRepository;
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
        return ResponseEntity.ok(skolverketService.getAllSubjects());
    }

    @GetMapping("/subjects/{code}")
    public ResponseEntity<Object> getSubject(@PathVariable String code) {
        return ResponseEntity.ok(skolverketService.getSubject(code));
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
                Object apiResponse = skolverketService.getSubject(code);
                if (apiResponse instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = (Map<String, Object>) apiResponse;
                    @SuppressWarnings("unchecked")
                    Map<String, Object> subjectData = (Map<String, Object>) data.get("subject");

                    if (subjectData != null) {
                        // Save subject-level SkolverketCourse
                        Optional<SkolverketCourse> skCourseOpt = skolverketCourseRepository.findByCourseCode(code);
                        SkolverketCourse skCourse;

                        if (skCourseOpt.isPresent()) {
                            skCourse = skCourseOpt.get();
                        } else {
                            skCourse = new SkolverketCourse();
                            skCourse.setCourseCode(code);
                            skCourse.setCourseName(name);
                            skCourse.setSubject(name);
                            skCourse.setPoints(100);
                        }

                        skCourse.setDescription((String) subjectData.get("description"));
                        skCourse.setSubjectPurpose((String) subjectData.get("purpose"));
                        skCourse.setEnglishTitle((String) subjectData.get("englishName"));

                        skolverketCourseRepository.save(skCourse);

                        if (skCourse.getDescription() != null && !skCourse.getDescription().isEmpty()) {
                            course.setDescription(skCourse.getDescription());
                        }

                        // --- Parse individual courses within the subject ---
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> courses = (List<Map<String, Object>>) subjectData.get("courses");
                        SkolverketCourse linkedCourse = skCourse; // Default: link to subject-level

                        if (courses != null) {
                            boolean isFirstCourse = true;
                            for (Map<String, Object> apiCourse : courses) {
                                String courseCode = (String) apiCourse.get("code");
                                String courseName = (String) apiCourse.get("name");
                                if (courseCode == null) continue;

                                // Find or create SkolverketCourse for this specific course
                                Optional<SkolverketCourse> existingSkCourse = skolverketCourseRepository
                                        .findByCourseCode(courseCode);
                                SkolverketCourse skIndividualCourse;

                                if (existingSkCourse.isPresent()) {
                                    skIndividualCourse = existingSkCourse.get();
                                } else {
                                    skIndividualCourse = new SkolverketCourse();
                                    skIndividualCourse.setCourseCode(courseCode);
                                    skIndividualCourse.setCourseName(courseName);
                                    skIndividualCourse.setSubject(name);
                                }

                                // Parse points
                                Object pointsObj = apiCourse.get("points");
                                if (pointsObj != null) {
                                    try {
                                        skIndividualCourse
                                                .setPoints(Integer.parseInt(pointsObj.toString().trim()));
                                    } catch (NumberFormatException ignored) {
                                    }
                                }

                                // Map course-level fields
                                skIndividualCourse.setDescription((String) apiCourse.get("description"));
                                skIndividualCourse
                                        .setEnglishTitle((String) apiCourse.get("englishName"));
                                skIndividualCourse.setSubjectPurpose(
                                        (String) subjectData.get("purpose"));

                                // Extract centralContent
                                @SuppressWarnings("unchecked")
                                Map<String, Object> centralContent = (Map<String, Object>) apiCourse
                                        .get("centralContent");
                                if (centralContent != null) {
                                    skIndividualCourse
                                            .setObjectives((String) centralContent.get("text"));
                                }

                                skolverketCourseRepository.save(skIndividualCourse);

                                // Link the EduFlex Course to the FIRST individual course
                                // (this is where criteria, centralContent, etc. live)
                                if (isFirstCourse) {
                                    linkedCourse = skIndividualCourse;
                                    isFirstCourse = false;
                                }

                                // --- Extract and save knowledgeRequirements (betygskriterier) ---
                                @SuppressWarnings("unchecked")
                                List<Map<String, Object>> knowledgeReqs = (List<Map<String, Object>>) apiCourse
                                        .get("knowledgeRequirements");
                                if (knowledgeReqs != null && !knowledgeReqs.isEmpty()) {
                                    // Clear old criteria for this course
                                    gradingCriteriaRepository.deleteByCourse(skIndividualCourse);

                                    Map<String, Integer> gradeOrder = Map.of(
                                            "E", 1, "D", 2, "C", 3, "B", 4, "A", 5);

                                    for (Map<String, Object> req : knowledgeReqs) {
                                        String gradeStep = (String) req.get("gradeStep");
                                        String text = (String) req.get("text");
                                        if (gradeStep == null || text == null) continue;

                                        SkolverketGradingCriteria criteria = new SkolverketGradingCriteria(
                                                skIndividualCourse,
                                                gradeStep,
                                                text,
                                                gradeOrder.getOrDefault(gradeStep, 0));
                                        gradingCriteriaRepository.save(criteria);
                                    }
                                }
                            }
                        }

                        // Link Course to the best SkolverketCourse (individual > subject)
                        course.setSkolverketCourse(linkedCourse);
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to fetch/save Skolverket rich data: " + e.getMessage());
                e.printStackTrace();
            }

            courseRepository.save(course);

            return ResponseEntity.ok(Map.of("success", true, "id", course.getId()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
