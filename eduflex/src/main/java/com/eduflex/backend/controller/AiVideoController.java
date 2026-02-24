package com.eduflex.backend.controller;

import com.eduflex.backend.model.CourseMaterial;
import com.eduflex.backend.repository.CourseMaterialRepository;
import com.eduflex.backend.service.EventBusService;
import com.eduflex.backend.service.ai.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for AI-driven video generation.
 * Handles script generation via Gemini and publishing production events.
 */
@RestController
@RequestMapping("/api/ai/video")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class AiVideoController {

    private final CourseMaterialRepository materialRepository;
    private final GeminiService geminiService;
    private final EventBusService eventBusService;
    private final ObjectMapper objectMapper;

    /**
     * Start the AI video generation process for a specific material.
     * 
     * POST /api/ai/video/generate/{materialId}
     */
    @PostMapping("/generate/{materialId}")
    public ResponseEntity<?> generateAiVideo(@PathVariable Long materialId) {
        log.info("Requesting AI video generation for materialId={}", materialId);

        try {
            // 1. Find material
            CourseMaterial material = materialRepository.findById(materialId)
                    .orElseThrow(() -> new RuntimeException("Material not found"));

            // 2. Extract content for script generation
            String sourceContent = material.getContent();
            if (sourceContent == null || sourceContent.isBlank()) {
                sourceContent = "Ämne: " + material.getTitle();
            }

            // 3. Generate Script via Gemini
            String scriptJson = geminiService.generateVideoScript(sourceContent);
            material.setAiVideoScript(scriptJson);
            material.setVideoStatus(CourseMaterial.VideoStatus.PROCESSING);

            CourseMaterial saved = materialRepository.save(material);

            // 4. Publish Event to Video Microservice
            Map<String, String> event = new HashMap<>();
            event.put("action", "GENERATE_AI_VIDEO");
            event.put("fileId", saved.getId().toString());
            event.put("script", scriptJson);

            String eventMessage = objectMapper.writeValueAsString(event);
            eventBusService.publish("video.upload", eventMessage); // Reuse the same channel for now

            return ResponseEntity.ok(Map.of(
                    "message", "AI Video generation started",
                    "materialId", saved.getId(),
                    "status", saved.getVideoStatus()));

        } catch (Exception e) {
            log.error("Failed to trigger AI video generation", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
