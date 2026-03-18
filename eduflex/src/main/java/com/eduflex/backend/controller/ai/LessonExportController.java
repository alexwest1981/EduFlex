package com.eduflex.backend.controller.ai;

import com.eduflex.backend.service.ai.LessonExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai/export")
public class LessonExportController {

    @Autowired
    private LessonExportService exportService;

    @PostMapping("/pdf")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> exportToPdf(@RequestParam Long courseId, @RequestParam Long lessonId) {
        try {
            exportService.exportToPdf(courseId, lessonId);
            return ResponseEntity.ok(Map.of("message", "PDF-export påbörjad och sparad i Material."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/word")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> exportToWord(@RequestParam Long courseId, @RequestParam Long lessonId) {
        try {
            exportService.exportToWord(courseId, lessonId);
            return ResponseEntity.ok(Map.of("message", "Word-export påbörjad och sparad i Material."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/excel")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> exportToExcel(@RequestParam Long courseId, @RequestParam Long lessonId) {
        try {
            exportService.exportToExcel(courseId, lessonId);
            return ResponseEntity.ok(Map.of("message", "Excel-export påbörjad och sparad i Material."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/epub")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> exportToEpub(@RequestParam Long courseId, @RequestParam Long lessonId) {
        try {
            exportService.exportToEpub(courseId, lessonId);
            return ResponseEntity.ok(Map.of("message", "EPUB-export påbörjad och sparad i Material."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
