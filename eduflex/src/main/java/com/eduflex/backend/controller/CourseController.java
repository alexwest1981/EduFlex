package com.eduflex.backend.controller;

import com.eduflex.backend.dto.CourseDTO;
import com.eduflex.backend.dto.CreateCourseDTO;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CourseMaterial;
import com.eduflex.backend.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
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
        System.out.println("--- HÄMTAR KURS ID: " + id + " ---");
        try {
            CourseDTO dto = courseService.getCourseDTOById(id);
            System.out.println("--- KURS HITTAD, SKICKAR DTO ---");
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            System.out.println("--- FEL VID HÄMTNING AV KURS: " + e.getMessage() + " ---");
            e.printStackTrace();
            return ResponseEntity.notFound().build();
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
            // Här var felet tidigare: ordningen på argumenten eller antalet
            // Nu matchar vi CourseService.addMaterial(Long courseId, String title, String content, String link, String type, MultipartFile file)
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
            System.out.println("--- SKAPAR KURS: " + createCourseDTO.name() + " ---");
            Course newCourse = courseService.createCourse(createCourseDTO, teacherId);
            return ResponseEntity.ok(courseService.getCourseDTOById(newCourse.getId()));
        } catch (Exception e) {
            e.printStackTrace();
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

    // --- NY ENDPOINT: Hämta tillgängliga kurser (Kurskatalog) ---
    // Returnerar alla kurser som studenten INTE redan går
    @GetMapping("/available/{studentId}")
    public ResponseEntity<List<CourseDTO>> getAvailableCourses(@PathVariable Long studentId) {
        try {
            // Kontrollera att denna metod finns i CourseService!
            // Om den saknas i din version av CourseService, måste den läggas till där först.
            // Jag utgår från att den lades till i föregående steg.
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
}