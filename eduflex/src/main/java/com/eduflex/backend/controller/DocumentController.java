package com.eduflex.backend.controller;

import com.eduflex.backend.model.Document;
import com.eduflex.backend.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentService documentService;
    private final org.springframework.data.redis.core.StringRedisTemplate redisTemplate;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public DocumentController(DocumentService documentService,
            org.springframework.data.redis.core.StringRedisTemplate redisTemplate,
            com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.documentService = documentService;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/all")
    public List<Document> getAll() {
        return documentService.getAllDocuments();
    }

    @GetMapping("/user/{userId}")
    public List<Document> getUserDocs(@PathVariable Long userId) {
        return documentService.getUserDocuments(userId);
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<Document> upload(@PathVariable Long userId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Long folderId) {
        try {
            Document saved = documentService.uploadFile(userId, file, folderId);

            // Publish PDF Event if PDF
            if ("application/pdf".equals(file.getContentType())) {
                try {
                    java.util.Map<String, String> event = new java.util.HashMap<>();
                    event.put("action", "PROCESS_PDF");
                    event.put("fileId", saved.getId().toString());
                    event.put("path", saved.getFileUrl());

                    String message = objectMapper.writeValueAsString(event);
                    redisTemplate.convertAndSend("pdf.upload", message);
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/folder/{folderId}")
    public List<Document> getFolderDocs(@PathVariable Long folderId, @RequestParam Long userId) {
        return documentService.getFolderDocuments(userId, folderId);
    }

    @GetMapping("/user/{userId}/root")
    public List<Document> getRootDocs(@PathVariable Long userId) {
        return documentService.getFolderDocuments(userId, null);
    }

    @GetMapping("/usage/{userId}")
    public ResponseEntity<?> getUsage(@PathVariable Long userId) {
        return ResponseEntity.ok(documentService.getStorageUsage(userId));
    }
}