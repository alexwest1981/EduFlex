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

    public AITutorController(AITutorService aiTutorService) {
        this.aiTutorService = aiTutorService;
    }

    /**
     * Ingest a document (CourseMaterial) for RAG.
     * Accessible by TEACHER and ADMIN.
     */
    @PostMapping("/ingest")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> ingestDocument(@RequestBody Map<String, Long> payload) {
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
     * Ask the AI Tutor a question.
     * Accessible by STUDENT, TEACHER, ADMIN.
     */
    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, Object> payload) {
        Object courseIdObj = payload.get("courseId");
        if (courseIdObj == null) {
            return ResponseEntity.badRequest().body("Missing courseId");
        }
        Long courseId = Long.valueOf(courseIdObj.toString());

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
        Object courseIdObj = payload.get("courseId");
        if (courseIdObj == null) {
            return ResponseEntity.badRequest().body("Missing courseId");
        }

        Long courseId = Long.valueOf(courseIdObj.toString());

        // Run async
        new Thread(() -> aiTutorService.ingestCourse(courseId)).start();

        return ResponseEntity.ok("Bulk ingestion started. Please wait a few minutes.");
    }
}
