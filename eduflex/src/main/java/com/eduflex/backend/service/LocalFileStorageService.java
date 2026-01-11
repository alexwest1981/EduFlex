package com.eduflex.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class LocalFileStorageService implements FileStorageService {

    private final Path fileStorageLocation;

    public LocalFileStorageService() {
        // Här sparas filerna. Ändra "uploads" till en absolut sökväg om du vill (t.ex.
        // "C:/EduFlex/uploads")
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Kunde inte skapa mappen för uppladdade filer.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        // Generera unikt filnamn för att undvika krockar
        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + fileExtension;

        try {
            // Kontrollera filnamnet
            if (fileName.contains("..")) {
                throw new RuntimeException("Filnamnet innehåller ogiltig sökväg " + fileName);
            }

            // Kopiera filen till målmålet (ersätt befintlig fil med samma namn)
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Returnera URL-sökvägen (anpassa efter hur du serverar statiska filer)
            return "/uploads/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Kunde inte spara filen " + fileName + ". Försök igen!", ex);
        }
    }
}