package com.eduflex.backend.service;

import com.eduflex.backend.model.Document;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.DocumentRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
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
                user
        );
        return documentRepository.save(doc);
    }

    public List<Document> getAllDocuments() { return documentRepository.findAll(); }
    public List<Document> getUserDocuments(Long userId) { return documentRepository.findByOwnerId(userId); }

    public void deleteDocument(Long id) {
        documentRepository.findById(id).ifPresent(doc -> {
            // (Valfritt: Ta bort filen från disken här också)
            documentRepository.delete(doc);
        });
    }
}