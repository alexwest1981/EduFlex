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
    public CourseController(CourseService courseService, CourseRepository courseRepository) {
        this.courseService = courseService;
        this.courseRepository = courseRepository;
    }

    // --- GET & CRUD ---
    @GetMapping
    public List<CourseDTO> getAllCourses() { return courseService.getAllCourseDTOs(); }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourse(@PathVariable Long id) {
        try { return ResponseEntity.ok(courseService.getCourseDTOById(id)); }
        catch (Exception e) { return ResponseEntity.notFound().build(); }
    }

    @PostMapping
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CreateCourseDTO createCourseDTO) {
        try {
            Long teacherId = createCourseDTO.teacherId() != null ? createCourseDTO.teacherId() : 1L;
            Course newCourse = courseService.createCourse(createCourseDTO, teacherId);
            return ResponseEntity.ok(courseService.getCourseDTOById(newCourse.getId()));
        } catch (Exception e) { return ResponseEntity.badRequest().build(); }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        try { return ResponseEntity.ok(courseService.updateCourse(id, updates)); }
        catch (Exception e) { return ResponseEntity.badRequest().build(); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok().build();
    }

    // --- MATERIAL (Fixar felet här) ---

    @GetMapping("/{id}/materials")
    public List<CourseMaterial> getMaterials(@PathVariable Long id) {
        return courseService.getMaterialsForCourse(id);
    }

    @PostMapping(value = "/{id}/materials", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CourseMaterial> addMaterial(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "link", required = false) String link,
            @RequestParam(value = "type", defaultValue = "TEXT") String type,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            return ResponseEntity.ok(courseService.addMaterial(id, title, content, link, type, file));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // NYTT: Uppdatera material (PUT)
    @PutMapping(value = "/materials/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CourseMaterial> updateMaterial(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "link", required = false) String link,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            return ResponseEntity.ok(courseService.updateMaterial(id, title, content, link, file));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/materials/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        courseService.deleteMaterial(id);
        return ResponseEntity.ok().build();
    }

    // --- ANSÖKNINGAR ---
    @PostMapping("/{id}/apply/{studentId}")
    public ResponseEntity<?> applyToCourse(@PathVariable Long id, @PathVariable Long studentId) {
        try {
            courseService.applyToCourse(id, studentId);
            return ResponseEntity.ok().body("{\"message\": \"Ansökan skickad\"}");
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @GetMapping("/applications/teacher/{teacherId}")
    public List<CourseApplication> getTeacherApplications(@PathVariable Long teacherId) {
        return courseService.getPendingApplications(teacherId);
    }

    @PostMapping("/applications/{appId}/{status}")
    public ResponseEntity<?> handleApplication(@PathVariable Long appId, @PathVariable String status) {
        try {
            courseService.handleApplication(appId, status.equalsIgnoreCase("approve"));
            return ResponseEntity.ok().build();
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // --- ÖVRIGT ---
    @GetMapping("/available/{studentId}")
    public ResponseEntity<List<CourseDTO>> getAvailableCourses(@PathVariable Long studentId) {
        return ResponseEntity.ok(courseService.getAvailableCoursesForStudent(studentId));
    }

    @PostMapping("/{courseId}/enroll/{studentId}")
    public ResponseEntity<Void> enrollStudent(@PathVariable Long courseId, @PathVariable Long studentId) {
        courseService.addStudentToCourse(courseId, studentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/student/{studentId}")
    public List<Course> getStudentCourses(@PathVariable Long studentId) {
        return courseRepository.findByStudentsId(studentId);
    }

    @PostMapping("/{id}/evaluation")
    public ResponseEntity<CourseEvaluation> createEvaluation(@PathVariable Long id, @RequestBody CourseEvaluation evaluation) {
        return ResponseEntity.ok(courseService.createEvaluation(id, evaluation));
    }
}