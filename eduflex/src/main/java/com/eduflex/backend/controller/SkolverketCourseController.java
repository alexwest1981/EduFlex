package com.eduflex.backend.controller;

import com.eduflex.backend.model.SkolverketCourse;
import com.eduflex.backend.model.SkolverketGradingCriteria;
import com.eduflex.backend.service.SkolverketCourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/skolverket")
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
public class SkolverketCourseController {

    @Autowired
    private SkolverketCourseService service;

    @GetMapping("/courses")
    public ResponseEntity<List<SkolverketCourse>> getAllCourses() {
        return ResponseEntity.ok(service.getAllCourses());
    }

    @GetMapping("/courses/search")
    public ResponseEntity<List<SkolverketCourse>> searchCourses(@RequestParam String q) {
        return ResponseEntity.ok(service.searchCourses(q));
    }

    @GetMapping("/courses/subject/{subject}")
    public ResponseEntity<List<SkolverketCourse>> getCoursesBySubject(@PathVariable String subject) {
        return ResponseEntity.ok(service.getCoursesBySubject(subject));
    }

    @GetMapping("/courses/{code}")
    public ResponseEntity<SkolverketCourse> getCourseByCode(@PathVariable String code) {
        SkolverketCourse course = service.getCourseByCode(code);
        if (course != null) {
            return ResponseEntity.ok(course);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<String>> getSubjects() {
        return ResponseEntity.ok(service.getAllSubjects());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        long total = service.getCount();
        long completed = service.getCompletedCount(); // Courses with description filled
        stats.put("total", total);
        stats.put("completed", completed);
        stats.put("subjects", service.getAllSubjects().size());
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/import")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> importCsv(@RequestParam("file") MultipartFile file) {
        try {
            int imported = service.importFromCsv(file);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("imported", imported);
            response.put("total", service.getCount());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/courses")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteAll() {
        service.deleteAll();
        Map<String, String> response = new HashMap<>();
        response.put("message", "All Skolverket courses deleted");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/courses/{code}/criteria")
    public ResponseEntity<List<SkolverketGradingCriteria>> getCriteria(@PathVariable String code) {
        List<SkolverketGradingCriteria> criteria = service.getCriteriaByCode(code);
        return ResponseEntity.ok(criteria);
    }

    @PutMapping("/courses/{code}/details")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<SkolverketCourse> updateCourseDetails(@PathVariable String code,
            @RequestBody Map<String, String> details) {
        try {
            SkolverketCourse updated = service.updateCourseDetails(code, details);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/courses/{code}/criteria")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<List<SkolverketGradingCriteria>> saveCriteria(@PathVariable String code,
            @RequestBody List<Map<String, Object>> criteriaData) {
        try {
            List<SkolverketGradingCriteria> saved = service.saveCriteria(code, criteriaData);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
