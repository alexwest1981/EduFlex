package com.eduflex.backend.service;

import com.eduflex.backend.model.Document;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.DocumentRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.config.KafkaConfig;
import com.eduflex.backend.event.DocumentUploadedEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    public DocumentService(DocumentRepository documentRepository, UserRepository userRepository,
            StorageService storageService) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    public Document uploadFile(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        String storageId = storageService.save(file);

        // Spara metadata i DB
        Document doc = new Document(
                file.getOriginalFilename(),
                file.getContentType(),
                "/api/storage/" + storageId,
                file.getSize(),
                user);

        doc = documentRepository.save(doc);

        // Skicka Kafka-event
        if (kafkaTemplate != null) {
            try {
                kafkaTemplate.send(KafkaConfig.DOCUMENT_UPLOADED_TOPIC, new DocumentUploadedEvent(
                        doc.getId(),
                        doc.getFileName(),
                        doc.getFileUrl(),
                        doc.getFileType(),
                        doc.getSize(),
                        user.getId()));
            } catch (Exception e) {
                System.err.println("⚠ Failed to send Kafka event: " + e.getMessage());
            }
        }

        return doc;
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public List<Document> getUserDocuments(Long userId) {
        return documentRepository.findByOwnerIdOrSharedWithId(userId);
    }

    public void shareDocument(Long docId, Long targetUserId) {
        Document doc = documentRepository.findById(docId).orElseThrow();
        User target = userRepository.findById(targetUserId).orElseThrow();
        doc.getSharedWith().add(target);
        documentRepository.save(doc);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteDocument(Long id) {
        documentRepository.findById(id).ifPresent(doc -> {
            doc.getSharedWith().clear();
            documentRepository.save(doc);

            try {
                String storageId = doc.getFileUrl().replace("/api/storage/", "");
                storageService.delete(storageId);
            } catch (Exception e) {
                System.err.println("Could not delete file from storage: " + e.getMessage());
            }

            documentRepository.delete(doc);
        });
    }

    public java.io.InputStream getFileStream(Long documentId) throws IOException {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        String storageId = doc.getFileUrl().replace("/api/storage/", "");
        return storageService.load(storageId);
    }
}
