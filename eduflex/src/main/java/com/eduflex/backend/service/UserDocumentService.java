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

    // Mapp där filer sparas
    private final Path fileStorageLocation;

    @Autowired
    public UserDocumentService(UserDocumentRepository documentRepository, UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;

        // Skapa uppladdningsmappen om den inte finns
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Kunde inte skapa mappen för uppladdade filer.", ex);
        }
    }

    public List<UserDocument> getDocumentsForUser(Long userId) {
        return documentRepository.findByOwnerId(userId);
    }

    // NY METOD: Tar emot en fil + metadata
    public UserDocument saveDocument(Long userId, MultipartFile file, String title, String type, String description) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Användare hittades inte"));

        // Rensa filnamnet
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

        // Skapa ett unikt filnamn för att undvika krockar (t.ex. "uuid-mittcv.pdf")
        String fileName = UUID.randomUUID().toString() + "_" + originalFileName;

        try {
            // Spara filen på disken
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Skapa databasobjektet
            UserDocument doc = new UserDocument();
            doc.setTitle(title);
            doc.setType(type);
            doc.setDescription(description);
            doc.setUploadDate(LocalDate.now());
            doc.setOwner(user);

            // Spara filinfo
            doc.setFileName(originalFileName);
            doc.setContentType(file.getContentType());
            doc.setFileUrl("/uploads/" + fileName); // Sökväg som frontend kan använda senare (kräver konfig)

            return documentRepository.save(doc);

        } catch (IOException ex) {
            throw new RuntimeException("Kunde inte spara filen " + fileName + ". Försök igen!", ex);
        }
    }

    public void deleteDocument(Long docId) {
        // Här kan man också lägga till logik för att ta bort filen från disken om man vill
        documentRepository.deleteById(docId);
    }
}