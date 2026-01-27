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

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public DocumentService(DocumentRepository documentRepository, UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }

    public Document uploadFile(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        // Skapa filnamn och spara på disk
        String originalName = file.getOriginalFilename();
        String uniqueName = UUID.randomUUID() + "_" + originalName;
        Path path = Paths.get(uploadDir + "/" + uniqueName);
        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());

        // Spara metadata i DB
        Document doc = new Document(
                originalName,
                file.getContentType(),
                "/uploads/" + uniqueName,
                file.getSize(),
                user);

        doc = documentRepository.save(doc);

        // Skicka Kafka-event för asynkron processering (AI, Media, etc)
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
                System.err.println("⚠ Failed to send Kafka event (Kafka might be down or disabled): " + e.getMessage());
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
            // Rensa delningar först för att undvika FK-problem
            doc.getSharedWith().clear();
            documentRepository.save(doc); // Flush relation changes

            // Ta bort filen från disken
            try {
                String fileName = doc.getFileUrl().replace("/uploads/", "");
                Path path = Paths.get(uploadDir + "/" + fileName);
                Files.deleteIfExists(path);
            } catch (IOException e) {
                System.err.println("Could not delete file from disk: " + e.getMessage());
            }

            documentRepository.delete(doc);
        });
    }

    public java.io.InputStream getFileStream(Long documentId) throws IOException {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Extract filename from URL (remove /uploads/ prefix if present)
        String fileName = doc.getFileUrl();
        if (fileName.startsWith("/uploads/")) {
            fileName = fileName.substring("/uploads/".length());
        }

        Path path = Paths.get(uploadDir + "/" + fileName);
        return Files.newInputStream(path);
    }
}