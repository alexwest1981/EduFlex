package com.eduflex.backend.controller;

import com.eduflex.backend.model.CourseMaterial;
import com.eduflex.backend.repository.CourseMaterialRepository;
import com.eduflex.backend.service.StorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * Dedicated controller for video lesson management.
 * Provides endpoints for video upload, metadata updates, and chapters.
 */
@RestController
@RequestMapping("/api/videos")
@CrossOrigin(origins = "*")
public class VideoController {

    private final CourseMaterialRepository materialRepository;
    private final StorageService storageService;

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${file.upload-dir}")
    private String uploadDir;

    // Max file size for video uploads (500MB default)
    private static final long MAX_VIDEO_SIZE = 500 * 1024 * 1024;

    public VideoController(CourseMaterialRepository materialRepository,
            StorageService storageService,
            StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper) {
        this.materialRepository = materialRepository;
        this.storageService = storageService;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Upload video for a course material.
     * Returns the material with updated video metadata.
     *
     * POST /api/videos/upload/{materialId}
     */
    @PostMapping("/upload/{materialId}")
    public ResponseEntity<?> uploadVideo(
            @PathVariable Long materialId,
            @RequestParam("file") MultipartFile file) {

        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
            }

            if (file.getSize() > MAX_VIDEO_SIZE) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "File too large",
                        "maxSize", MAX_VIDEO_SIZE,
                        "actualSize", file.getSize()));
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("video/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "File must be a video"));
            }

            // Find material
            CourseMaterial material = materialRepository.findById(materialId)
                    .orElseThrow(() -> new RuntimeException("Material not found"));

            // Store file using MinIO (or local storage depending on config)
            String storageId = storageService.save(file);
            String fileUrl = "/api/storage/" + storageId;

            // Update material with video info
            material.setFileUrl(fileUrl);
            material.setFileName(file.getOriginalFilename());
            material.setType(CourseMaterial.MaterialType.VIDEO);
            material.setVideoFileSize(file.getSize());
            material.setVideoStatus(CourseMaterial.VideoStatus.PROCESSING); // New status

            CourseMaterial saved = materialRepository.save(material);

            // Publish Event to Redis
            try {
                Map<String, String> event = new HashMap<>();
                event.put("action", "PROCESS_VIDEO");
                event.put("fileId", saved.getId().toString());
                event.put("path", fileUrl);

                String message = objectMapper.writeValueAsString(event);
                redisTemplate.convertAndSend("video.upload", message);
            } catch (Exception e) {
                e.printStackTrace(); // Log but don't fail the request
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", saved.getId());
            response.put("fileUrl", saved.getFileUrl());
            response.put("fileName", saved.getFileName());
            response.put("fileSize", saved.getVideoFileSize());
            response.put("status", saved.getVideoStatus());
            response.put("message", "Video uploading and processing started");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to upload video: " + e.getMessage()));
        }
    }

    /**
     * Update video metadata (duration, chapters, thumbnail).
     * Called from frontend after video loads.
     *
     * PATCH /api/videos/{materialId}/metadata
     */
    @PatchMapping("/{materialId}/metadata")
    public ResponseEntity<?> updateVideoMetadata(
            @PathVariable Long materialId,
            @RequestBody VideoMetadataRequest request) {

        try {
            CourseMaterial material = materialRepository.findById(materialId)
                    .orElseThrow(() -> new RuntimeException("Material not found"));

            if (request.duration != null) {
                material.setVideoDuration(request.duration);
            }

            if (request.thumbnailUrl != null) {
                material.setThumbnailUrl(request.thumbnailUrl);
            }

            if (request.chapters != null) {
                // Store chapters as JSON string
                material.setVideoChapters(request.chapters);
            }

            CourseMaterial saved = materialRepository.save(material);

            return ResponseEntity.ok(Map.of(
                    "id", saved.getId(),
                    "duration", saved.getVideoDuration() != null ? saved.getVideoDuration() : 0,
                    "thumbnailUrl", saved.getThumbnailUrl() != null ? saved.getThumbnailUrl() : "",
                    "chapters", saved.getVideoChapters() != null ? saved.getVideoChapters() : "[]",
                    "message", "Metadata updated"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get video info for a material.
     *
     * GET /api/videos/{materialId}
     */
    @GetMapping("/{materialId}")
    public ResponseEntity<?> getVideoInfo(@PathVariable Long materialId) {
        try {
            CourseMaterial material = materialRepository.findById(materialId)
                    .orElseThrow(() -> new RuntimeException("Material not found"));

            if (material.getType() != CourseMaterial.MaterialType.VIDEO) {
                return ResponseEntity.badRequest().body(Map.of("error", "Material is not a video"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", material.getId());
            response.put("title", material.getTitle());
            response.put("fileUrl", material.getFileUrl());
            response.put("fileName", material.getFileName());
            response.put("fileSize", material.getVideoFileSize());
            response.put("duration", material.getVideoDuration());
            response.put("thumbnailUrl", material.getThumbnailUrl());
            response.put("chapters", material.getVideoChapters());
            response.put("status", material.getVideoStatus());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update video chapters only.
     *
     * PUT /api/videos/{materialId}/chapters
     */
    @PutMapping("/{materialId}/chapters")
    public ResponseEntity<?> updateChapters(
            @PathVariable Long materialId,
            @RequestBody ChaptersRequest request) {

        try {
            CourseMaterial material = materialRepository.findById(materialId)
                    .orElseThrow(() -> new RuntimeException("Material not found"));

            material.setVideoChapters(request.chapters);
            materialRepository.save(material);

            return ResponseEntity.ok(Map.of(
                    "id", materialId,
                    "chapters", request.chapters,
                    "message", "Chapters updated"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Request DTOs ---

    static class VideoMetadataRequest {
        public Integer duration; // Duration in seconds
        public String thumbnailUrl;
        public String chapters; // JSON array: [{"time": 0, "title": "Intro"}, ...]
    }

    static class ChaptersRequest {
        public String chapters; // JSON array
    }
}
