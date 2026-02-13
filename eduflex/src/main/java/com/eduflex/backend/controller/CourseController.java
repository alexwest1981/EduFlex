package com.eduflex.backend.controller;

import com.eduflex.backend.dto.CourseDTO;
import com.eduflex.backend.dto.CreateCourseDTO;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CourseApplication;
import com.eduflex.backend.model.CourseEvaluation;
import com.eduflex.backend.model.CourseMaterial;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;
    private final CourseRepository courseRepository;

    @Autowired
    private com.eduflex.backend.repository.UserRepository userRepository;

    @Autowired
    public CourseController(CourseService courseService,
            CourseRepository courseRepository) {
        this.courseService = courseService;
        this.courseRepository = courseRepository;
    }

    /**
     * Helper to get current user from SecurityContext
     */
    private com.eduflex.backend.model.User getCurrentUser() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()
                || auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                org.springframework.http.HttpStatus.NOT_FOUND,
                                "User not found: " + username)));
    }

    // --- GET & CRUD ---
    @GetMapping
    public List<CourseDTO> getAllCourses() {
        return courseService.getAllCourseDTOs();
    }

    @GetMapping("/{idOrSlug}")
    public ResponseEntity<CourseDTO> getCourse(@PathVariable String idOrSlug) {
        try {
            // Try ID first
            try {
                Long id = Long.parseLong(idOrSlug);
                return ResponseEntity.ok(courseService.getCourseDTOById(id));
            } catch (NumberFormatException e) {
                // Not a number, try Slug first, then CourseCode
                return courseRepository.findBySlug(idOrSlug)
                        .map(course -> ResponseEntity.ok(courseService.convertToDTO(course)))
                        .orElseGet(() -> courseRepository.findByCourseCode(idOrSlug)
                                .map(course -> ResponseEntity.ok(courseService.convertToDTO(course)))
                                .orElse(ResponseEntity.notFound().build()));
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/my-courses")
    public List<CourseDTO> getMyCourses() {
        com.eduflex.backend.model.User currentUser = getCurrentUser();
        String role = currentUser.getRole() != null ? currentUser.getRole().getName() : "";

        if ("STUDENT".equals(role)) {
            return courseService.getCoursesForStudent(currentUser.getId());
        } else if ("TEACHER".equals(role)) {
            return courseService.getCoursesForTeacher(currentUser.getId());
        } else if ("ADMIN".equals(role)) {
            return courseService.getAllCourseDTOs();
        }

        return new java.util.ArrayList<>();
    }

    /**
     * Alias for /my-courses to support frontend API calls
     */
    @GetMapping("/my")
    public List<CourseDTO> getMyCoursesAlias() {
        return getMyCourses();
    }

    @GetMapping("/student/{studentId}")
    public List<Course> getStudentCourses(@PathVariable Long studentId) {
        return courseRepository.findByStudentsId(studentId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        try {
            return ResponseEntity.ok(courseService.updateCourse(id, updates));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // --- MATERIALHANTERING (FIXAD) ---

    @PostMapping(value = "/{id}/materials", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addMaterial(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "link", required = false) String link,
            @RequestParam(value = "type", defaultValue = "LESSON") String type, // Default till LESSON
            @RequestParam(value = "availableFrom", required = false) String availableFrom,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            // Logga för debugging
            System.out.println("Adding material: " + title + ", Type: " + type + ", Link: " + link);
            return ResponseEntity.ok(courseService.addMaterial(id, title, content, link, type, availableFrom, file));
        } catch (Exception e) {
            e.printStackTrace();
            String rootCause = e.getMessage();
            if (e.getCause() != null)
                rootCause += " | Cause: " + e.getCause().getMessage();
            return ResponseEntity.badRequest().body("Fel vid skapande av material: " + rootCause);
        }
    }

    @PutMapping(value = "/materials/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateMaterial(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "link", required = false) String link,
            @RequestParam(value = "availableFrom", required = false) String availableFrom,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            return ResponseEntity.ok(courseService.updateMaterial(id, title, content, link, availableFrom, file));
        } catch (Exception e) {
            e.printStackTrace();
            String rootCause = e.getMessage();
            if (e.getCause() != null)
                rootCause += " | Cause: " + e.getCause().getMessage();
            return ResponseEntity.badRequest().body("Fel vid uppdatering: " + rootCause);
        }
    }

    @GetMapping("/{id}/materials")
    public List<CourseMaterial> getMaterials(@PathVariable Long id) {
        return courseService.getMaterialsForCourse(id);
    }

    @GetMapping("/materials/{id}")
    public ResponseEntity<CourseMaterial> getMaterial(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getMaterialById(id));
    }

    @DeleteMapping("/materials/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        try {
            courseService.deleteMaterial(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // --- ÖVRIGA ENDPOINTS (KVAR) ---

    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody CreateCourseDTO createCourseDTO) {
        try {
            Long teacherId = createCourseDTO.teacherId() != null ? createCourseDTO.teacherId() : 1L;
            Course newCourse = courseService.createCourse(createCourseDTO, teacherId);
            return ResponseEntity.ok(courseService.getCourseDTOById(newCourse.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Fel vid skapande av kurs: " + e.getMessage());
        }
    }

    @PostMapping("/backfill-slugs")
    public ResponseEntity<String> backfillSlugs() {
        courseService.backfillSlugs();
        return ResponseEntity.ok("Slugs backfilled");
    }

    @PostMapping("/{courseId}/enroll/{studentId}")
    public ResponseEntity<Void> enrollStudent(@PathVariable Long courseId, @PathVariable Long studentId) {
        courseService.addStudentToCourse(courseId, studentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/available/{studentId}")
    public ResponseEntity<List<CourseDTO>> getAvailableCourses(@PathVariable Long studentId) {
        return ResponseEntity.ok(courseService.getAvailableCoursesForStudent(studentId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<Course> toggleCourseStatus(@PathVariable Long id) {
        Course course = courseService.getCourseById(id);
        course.setOpen(!course.isOpen());
        return ResponseEntity.ok(courseService.saveCourse(course));
    }

    // --- ANSÖKNINGAR ---
    @PostMapping("/{id}/apply/{studentId}")
    public ResponseEntity<?> applyToCourse(@PathVariable Long id, @PathVariable Long studentId) {
        try {
            courseService.applyToCourse(id, studentId);
            return ResponseEntity.ok().body("{\"message\": \"Ansökan skickad\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/applications/teacher/{teacherId}")
    public List<CourseApplication> getTeacherApplications(@PathVariable Long teacherId) {
        return courseService.getPendingApplications(teacherId);
    }

    @PostMapping("/applications/{appId}/{status}")
    public ResponseEntity<?> handleApplication(@PathVariable Long appId, @PathVariable String status) {
        courseService.handleApplication(appId, status.equalsIgnoreCase("approve"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/evaluation/submit")
    public ResponseEntity<Void> submitEvaluation(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Long studentId = ((Number) payload.get("studentId")).longValue();
        @SuppressWarnings("unchecked")
        Map<Integer, String> answers = (Map<Integer, String>) payload.get("answers");
        courseService.submitEvaluation(id, studentId, answers);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/evaluation")
    public ResponseEntity<CourseEvaluation> createEvaluation(@PathVariable Long id,
            @RequestBody CourseEvaluation evaluation) {
        return ResponseEntity.ok(courseService.createEvaluation(id, evaluation));
    }

    @PostMapping("/{id}/result/{studentId}")
    public ResponseEntity<Void> setCourseResult(@PathVariable Long id, @PathVariable Long studentId,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        courseService.setCourseResult(id, studentId, status);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/result/{studentId}")
    public ResponseEntity<com.eduflex.backend.model.CourseResult> getCourseResult(@PathVariable Long id,
            @PathVariable Long studentId) {
        return ResponseEntity.ok(courseService.getCourseResult(id, studentId));
    }

    @GetMapping("/results/student/{studentId}")
    public ResponseEntity<List<com.eduflex.backend.model.CourseResult>> getStudentResults(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(courseService.getStudentResults(studentId));
    }

    @GetMapping("/{id}/check-completion/{studentId}")
    public ResponseEntity<Boolean> checkCompletion(@PathVariable Long id, @PathVariable Long studentId) {
        return ResponseEntity.ok(courseService.validateCompletion(id, studentId));
    }

    @PostMapping("/{id}/claim-certificate/{studentId}")
    public ResponseEntity<?> claimCertificate(@PathVariable Long id, @PathVariable Long studentId) {
        try {
            courseService.claimCertificate(id, studentId);
            return ResponseEntity.ok().body("{\"message\": \"Certifikat utfärdat!\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- OPTIONS FOR DROPDOWNS ---
    @GetMapping("/options")
    public List<Map<String, Object>> getCourseOptions(@RequestParam Long userId, @RequestParam String role) {
        // Simplified Logic:
        // Admin -> All Courses
        // Teacher -> Own Courses
        // Student -> Enrolled Courses (Maybe later)

        List<Course> courses;
        if ("ADMIN".equalsIgnoreCase(role)) {
            courses = courseRepository.findAll();
        } else {
            // Assuming teacher
            courses = courseRepository.findByTeacherId(userId);
        }

        return courses.stream()
                .map(c -> Map.of("id", (Object) c.getId(), "title", (Object) c.getName()))
                .toList();
    }
}