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

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
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
    public ResponseEntity<Document> upload(@PathVariable Long userId, @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(documentService.uploadFile(userId, file));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<?> share(@PathVariable Long id, @RequestParam Long userId) {
        documentService.shareDocument(id, userId);
        return ResponseEntity.ok().build();
    }
}