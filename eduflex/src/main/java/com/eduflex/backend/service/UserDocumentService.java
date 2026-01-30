package com.eduflex.backend.service;

import com.eduflex.backend.model.User;
import com.eduflex.backend.model.UserDocument;
import com.eduflex.backend.repository.UserDocumentRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.List;

@Service
public class UserDocumentService {

    private final UserDocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    @Autowired
    public UserDocumentService(UserDocumentRepository documentRepository, UserRepository userRepository,
            StorageService storageService) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    public List<UserDocument> getDocumentsForUser(Long userId) {
        return documentRepository.findByOwnerId(userId);
    }

    public List<UserDocument> getAllDocuments() {
        return documentRepository.findAll();
    }

    public UserDocument saveDocument(Long userId, MultipartFile file, String title, String type, String description) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Användare hittades inte"));

        String storageId = storageService.save(file);

        UserDocument doc = new UserDocument();
        doc.setTitle(title);
        doc.setType(type);
        doc.setDescription(description);
        doc.setUploadDate(LocalDate.now());
        doc.setOwner(user);
        doc.setFileName(file.getOriginalFilename());
        doc.setContentType(file.getContentType());
        doc.setFileUrl("/api/storage/" + storageId);

        return documentRepository.save(doc);
    }

    public void deleteDocument(Long docId) {
        UserDocument doc = documentRepository.findById(docId).orElse(null);
        if (doc != null) {
            try {
                String storageId = doc.getFileUrl().replace("/api/storage/", "");
                storageService.delete(storageId);
            } catch (Exception e) {
                System.err.println("Kunde inte radera fil från storage: " + e.getMessage());
            }
            documentRepository.delete(doc);
        }
    }
}
