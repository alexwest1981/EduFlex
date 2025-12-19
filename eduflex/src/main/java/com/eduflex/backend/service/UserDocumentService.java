package com.eduflex.backend.service;

import com.eduflex.backend.model.User;
import com.eduflex.backend.model.UserDocument;
import com.eduflex.backend.repository.UserDocumentRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class UserDocumentService {

    private final UserDocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final Path fileStorageLocation;

    @Autowired
    public UserDocumentService(UserDocumentRepository documentRepository, UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;

        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Kunde inte skapa uppladdningsmappen.", ex);
        }
    }

    public List<UserDocument> getDocumentsForUser(Long userId) {
        return documentRepository.findByOwnerId(userId);
    }

    // NY METOD: Hämta ALLA dokument (för Admin)
    public List<UserDocument> getAllDocuments() {
        return documentRepository.findAll();
    }

    public UserDocument saveDocument(Long userId, MultipartFile file, String title, String type, String description) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Användare hittades inte"));
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileName = UUID.randomUUID().toString() + "_" + originalFileName;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            UserDocument doc = new UserDocument();
            doc.setTitle(title);
            doc.setType(type);
            doc.setDescription(description);
            doc.setUploadDate(LocalDate.now());
            doc.setOwner(user);
            doc.setFileName(originalFileName);
            doc.setContentType(file.getContentType());
            doc.setFileUrl("/uploads/" + fileName);

            return documentRepository.save(doc);
        } catch (IOException ex) {
            throw new RuntimeException("Kunde inte spara filen " + fileName, ex);
        }
    }

    public void deleteDocument(Long docId) {
        UserDocument doc = documentRepository.findById(docId).orElse(null);
        if (doc != null) {
            // Försök ta bort filen från disken
            try {
                String internalFileName = doc.getFileUrl().replace("/uploads/", "");
                Path filePath = this.fileStorageLocation.resolve(internalFileName);
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                System.err.println("Kunde inte radera fil från disk: " + e.getMessage());
            }
            documentRepository.delete(doc);
        }
    }
}