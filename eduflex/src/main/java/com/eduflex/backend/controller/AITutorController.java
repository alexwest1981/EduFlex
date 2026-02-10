package com.eduflex.backend.controller;

import com.eduflex.backend.service.ai.AITutorService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai-tutor")
public class AITutorController {

    private final AITutorService aiTutorService;
    private final com.eduflex.backend.service.ModuleService moduleService;
    private final com.eduflex.backend.repository.CourseRepository courseRepository;

    public AITutorController(AITutorService aiTutorService, 
                           com.eduflex.backend.service.ModuleService moduleService,
                           com.eduflex.backend.repository.CourseRepository courseRepository) {
        this.aiTutorService = aiTutorService;
        this.moduleService = moduleService;
        this.courseRepository = courseRepository;
    }

    /**
     * Ingest a document (CourseMaterial) for RAG.
     * Accessible by TEACHER and ADMIN.
     */
    @PostMapping("/ingest")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> ingestDocument(@RequestBody Map<String, Long> payload) {
        try {
            moduleService.toggleModule("AI_TUTOR", true);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("AI Tutor module is not available in your license.");
        }
        Long courseId = payload.get("courseId");
        Long documentId = payload.get("documentId");

        if (courseId == null || documentId == null) {
            return ResponseEntity.badRequest().body("Missing courseId or documentId");
        }

        // 'documentId' refers to the ID in CourseMaterial table
        try {
            aiTutorService.ingestMaterial(courseId, documentId);
            return ResponseEntity.ok("Material ingested successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error ingesting material: " + e.getMessage());
        }
    }

    /**
     * Ingest an Ebook for RAG.
     * Accessible by TEACHER and ADMIN.
     */
    @PostMapping("/ingest-ebook/{ebookId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> ingestEbook(@PathVariable Long ebookId) {
        try {
            moduleService.toggleModule("AI_TUTOR", true);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("AI Tutor module is not available in your license.");
        }

        try {
            // Run async to avoid blocking
            new Thread(() -> aiTutorService.ingestEbook(ebookId)).start();
            return ResponseEntity.ok("Ebook ingestion started. This may take a moment.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error starting ebook ingestion: " + e.getMessage());
        }
    }

    /**
     * Ask the AI Tutor a question.
     * Accessible by STUDENT, TEACHER, ADMIN.
     */
    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, Object> payload) {
        try {
            moduleService.toggleModule("AI_TUTOR", true);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("AI Tutor module is not available in your license.");
        }
        Object courseIdObj = payload.get("courseId");
        if (courseIdObj == null) {
            return ResponseEntity.badRequest().body("Missing courseId");
        }
        
        Long courseId = null;
        String courseIdStr = courseIdObj.toString();
        
        try {
            courseId = Long.valueOf(courseIdStr);
        } catch (NumberFormatException e) {
            // Not a number, try resolution by slug
            courseId = courseRepository.findBySlug(courseIdStr)
                    .map(com.eduflex.backend.model.Course::getId)
                    .orElse(null);
        }

        if (courseId == null) {
            return ResponseEntity.badRequest().body("Course not found: " + courseIdStr);
        }

        String question = (String) payload.get("question");

        if (courseId == null || question == null || question.isBlank()) {
            return ResponseEntity.badRequest().body("Missing courseId or question");
        }

        String answer = aiTutorService.askTutor(courseId, question);
        return ResponseEntity.ok(Map.of("answer", answer));
    }

    /**
     * Ingest ALL materials in a course.
     */
    @PostMapping("/ingest-course")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> ingestCourse(@RequestBody Map<String, Object> payload) {
        try {
            moduleService.toggleModule("AI_TUTOR", true);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("AI Tutor module is not available in your license.");
        }
        Object courseIdObj = payload.get("courseId");
        if (courseIdObj == null) {
            return ResponseEntity.badRequest().body("Missing courseId");
        }

        Long courseId = null;
        String courseIdStr = courseIdObj.toString();
        
        try {
            courseId = Long.valueOf(courseIdStr);
        } catch (NumberFormatException e) {
            courseId = courseRepository.findBySlug(courseIdStr)
                    .map(com.eduflex.backend.model.Course::getId)
                    .orElse(null);
        }

        if (courseId == null) {
            return ResponseEntity.badRequest().body("Course not found for ingestion: " + courseIdStr);
        }

        // Run async - need final var for lambda
        final Long finalCourseId = courseId;
        new Thread(() -> aiTutorService.ingestCourse(finalCourseId)).start();

        return ResponseEntity.ok("Bulk ingestion started. Please wait a few minutes.");
    }
}
