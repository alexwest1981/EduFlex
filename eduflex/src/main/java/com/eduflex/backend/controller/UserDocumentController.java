package com.eduflex.backend.controller;

import com.eduflex.backend.model.UserDocument;
import com.eduflex.backend.service.UserDocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class UserDocumentController {

    private final UserDocumentService documentService;

    @Autowired
    public UserDocumentController(UserDocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/user/{userId}")
    public List<UserDocument> getUserDocuments(@PathVariable Long userId) {
        return documentService.getDocumentsForUser(userId);
    }

    // NYTT: Tar emot fil och textdata via FormData
    @PostMapping(value = "/user/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDocument> uploadDocument(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("type") String type,
            @RequestParam(value = "description", required = false) String description) {
        try {
            UserDocument savedDoc = documentService.saveDocument(userId, file, title, type, description);
            return ResponseEntity.ok(savedDoc);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok().build();
    }
}