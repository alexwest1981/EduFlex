package com.eduflex.backend.controller;

import com.eduflex.backend.dto.CourseDTO;
import com.eduflex.backend.dto.CreateCourseDTO;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CourseEvaluation;
import com.eduflex.backend.model.CourseMaterial;
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

    @Autowired
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public List<CourseDTO> getAllCourses() {
        return courseService.getAllCourseDTOs();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourse(@PathVariable Long id) {
        try {
            CourseDTO dto = courseService.getCourseDTOById(id);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long id, @RequestBody CourseDTO courseDTO) {
        try {
            // Anropar servicen för att spara ändringarna
            CourseDTO updatedCourse = courseService.updateCourse(id, courseDTO);
            return ResponseEntity.ok(updatedCourse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // --- MATERIALHANTERING ---

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

    @GetMapping("/{id}/materials")
    public List<CourseMaterial> getMaterials(@PathVariable Long id) {
        return courseService.getMaterialsForCourse(id);
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

    // --- KURSHANTERING & REGISTRERING ---

    @PostMapping
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CreateCourseDTO createCourseDTO, @RequestParam Long teacherId) {
        try {
            Course newCourse = courseService.createCourse(createCourseDTO, teacherId);
            return ResponseEntity.ok(courseService.getCourseDTOById(newCourse.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{courseId}/enroll/{studentId}")
    public ResponseEntity<Void> enrollStudent(@PathVariable Long courseId, @PathVariable Long studentId) {
        try {
            courseService.addStudentToCourse(courseId, studentId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}")
    public List<Course> getCoursesForUser(@PathVariable Long userId) {
        return courseService.getCoursesForUser(userId);
    }

    @GetMapping("/available/{studentId}")
    public ResponseEntity<List<CourseDTO>> getAvailableCourses(@PathVariable Long studentId) {
        try {
            return ResponseEntity.ok(courseService.getAvailableCoursesForStudent(studentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // --- STATUS & UTVÄRDERING ---

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<Course> toggleCourseStatus(@PathVariable Long id) {
        try {
            Course course = courseService.getCourseById(id);
            course.setOpen(!course.isOpen());
            return ResponseEntity.ok(courseService.saveCourse(course));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/evaluation")
    public ResponseEntity<CourseEvaluation> createEvaluation(
            @PathVariable Long id,
            @RequestBody CourseEvaluation evaluation) {
        try {
            return ResponseEntity.ok(courseService.createEvaluation(id, evaluation));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/evaluation/submit")
    public ResponseEntity<Void> submitEvaluation(@PathVariable Long id, @RequestBody Map<String, Object> answers) {
        System.out.println("Mottog utvärderingssvar för kurs " + id + ": " + answers);
        return ResponseEntity.ok().build();
    }
}