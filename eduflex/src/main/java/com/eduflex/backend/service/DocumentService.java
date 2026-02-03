package com.eduflex.backend.service;

import com.eduflex.backend.model.Document;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.DocumentRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.repository.FolderRepository;
import com.eduflex.backend.model.Folder;
import com.eduflex.backend.config.KafkaConfig;
import com.eduflex.backend.event.DocumentUploadedEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    private final FolderRepository folderRepository;

    public DocumentService(DocumentRepository documentRepository,
            UserRepository userRepository,
            StorageService storageService,
            FolderRepository folderRepository) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.folderRepository = folderRepository;
    }

    public Document uploadFile(Long userId, MultipartFile file, Long folderId) throws IOException {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        // Check Quota
        long currentUsed = documentRepository.getTotalSizeByOwnerId(userId);
        if (currentUsed + file.getSize() > user.getStorageQuota()) {
            throw new RuntimeException(
                    "Storage quota exceeded. Usage: " + currentUsed + ", Quota: " + user.getStorageQuota());
        }

        Folder folder = (folderId != null) ? folderRepository.findById(folderId).orElse(null) : null;

        String storageId = storageService.save(file);

        // Spara metadata i DB
        Document doc = new Document(
                file.getOriginalFilename(),
                file.getContentType(),
                "/api/storage/" + storageId,
                file.getSize(),
                user);

        doc.setFolder(folder);

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
        return documentRepository.findByOwnerIdOrSharedWithUser(userId);
    }

    public List<Document> getFolderDocuments(Long userId, Long folderId) {
        return folderId == null
                ? documentRepository.findByOwnerIdAndFolderIsNull(userId)
                : documentRepository.findByOwnerIdAndFolderId(userId, folderId);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteDocument(Long id) {
        documentRepository.findById(id).ifPresent(doc -> {
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

    public java.util.Map<String, Object> getStorageUsage(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        long used = documentRepository.getTotalSizeByOwnerId(userId);

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("used", used);
        stats.put("quota", user.getStorageQuota());
        return stats;
    }

    public java.util.Map<String, Object> getSystemStorageUsage() {
        long used = documentRepository.getTotalSizeForAllUsers();
        long totalDocs = documentRepository.countTotalDocuments();
        long totalUsers = userRepository.count();

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalUsed", used);
        stats.put("totalDocuments", totalDocs);
        stats.put("totalUsers", totalUsers);
        return stats;
    }
}
