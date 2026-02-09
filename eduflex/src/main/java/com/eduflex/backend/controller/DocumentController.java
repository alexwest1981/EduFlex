package com.eduflex.backend.controller;

import com.eduflex.backend.model.Document;
import com.eduflex.backend.repository.DocumentRepository;
import com.eduflex.backend.service.AutoDocumentService;
import com.eduflex.backend.service.DocumentService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentService documentService;
    private final DocumentRepository documentRepository;
    private final AutoDocumentService autoDocumentService;
    private final org.springframework.data.redis.core.StringRedisTemplate redisTemplate;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public DocumentController(DocumentService documentService,
                              DocumentRepository documentRepository,
                              AutoDocumentService autoDocumentService,
                              org.springframework.data.redis.core.StringRedisTemplate redisTemplate,
                              com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.documentService = documentService;
        this.documentRepository = documentRepository;
        this.autoDocumentService = autoDocumentService;
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
                                          @RequestParam(required = false) Long folderId,
                                          @RequestParam(required = false) String category,
                                          @RequestParam(required = false, defaultValue = "false") boolean official,
                                          @RequestParam(required = false, defaultValue = "false") boolean isGlobal) {
        try {
            Document saved = documentService.uploadFile(userId, file, folderId, category, official, isGlobal);

            // Publish PDF Event if PDF
            if ("application/pdf".equals(file.getContentType())) {
                try {
                    Map<String, String> event = new HashMap<>();
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
        try {
            documentService.deleteDocument(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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

    @GetMapping("/merits/{userId}")
    public ResponseEntity<List<Document>> getMerits(@PathVariable Long userId) {
        return ResponseEntity.ok(documentService.getMerits(userId));
    }

    @GetMapping("/system")
    public ResponseEntity<List<Document>> getSystemDocs() {
        return ResponseEntity.ok(documentService.getGlobalDocuments());
    }
    
    /**
     * Public endpoint for verifying document authenticity via QR code.
     * Returns document metadata without sensitive information.
     */
    @GetMapping("/verify/{verificationCode}")
    public ResponseEntity<?> verifyDocument(@PathVariable String verificationCode) {
        try {
            Document doc = documentRepository.findByVerificationCode(verificationCode)
                    .orElseThrow(() -> new RuntimeException("Dokument hittas inte"));
            
            // Return public verification info (no sensitive data)
            Map<String, Object> verificationInfo = new HashMap<>();
            verificationInfo.put("studentName", doc.getOwner().getFullName());
            verificationInfo.put("documentType", doc.getCategory());
            verificationInfo.put("issuedDate", doc.getUploadedAt());
            verificationInfo.put("isOfficial", doc.isOfficial());
            verificationInfo.put("fileName", doc.getFileName());
            
            return ResponseEntity.ok(verificationInfo);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of(
                    "error", "Dokument hittades inte",
                    "message", "Detta dokument kunde inte verifieras"
            ));
        }
    }
    
    /**
     * Generates a consolidated grade report PDF for a student containing all their course results.
     * Returned as downloadable PDF.
     */
    @GetMapping("/grades/consolidated/{studentId}")
    public ResponseEntity<byte[]> getConsolidatedGradeReport(@PathVariable Long studentId) {
        try {
            byte[] pdf = autoDocumentService.generateConsolidatedGradeReport(studentId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(
                    ContentDisposition.attachment()
                            .filename("Samlade_Betyg_" + studentId + ".pdf")
                            .build()
            );
            
            return ResponseEntity.ok().headers(headers).body(pdf);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}