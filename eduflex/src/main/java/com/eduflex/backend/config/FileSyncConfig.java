package com.eduflex.backend.config;

import com.eduflex.backend.model.Document;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.DocumentRepository;
import com.eduflex.backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Optional;

@Configuration
public class FileSyncConfig {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.sync.enabled:false}")
    private boolean syncEnabled;

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    public FileSyncConfig(DocumentRepository documentRepository, UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }

    /**
     * Synkar filer från disk till databas. Inaktiverad som standard för att
     * undvika att raderade filer återregistreras. Aktivera med file.sync.enabled=true
     * om du behöver importera befintliga filer (t.ex. vid databasåterställning).
     */
    @PostConstruct
    public void syncFiles() {
        if (!syncEnabled) {
            System.out.println("ℹ️ FIL-SYNC: Inaktiverad (file.sync.enabled=false). Inga filer synkas.");
            return;
        }

        File folder = new File(uploadDir);
        if (!folder.exists() || !folder.isDirectory()) return;

        File[] files = folder.listFiles();
        if (files == null) return;

        Optional<User> defaultOwner = userRepository.findById(1L);

        if (defaultOwner.isEmpty()) {
            System.out.println("⚠️ FIL-SYNC: Ingen användare med ID 1 hittades. Gamla filer kopplas inte.");
            return;
        }

        int count = 0;
        for (File file : files) {
            if (file.isFile()) {
                String rawName = file.getName();

                String cleanName = rawName;
                if (rawName.contains("_") && rawName.length() > 37) {
                    cleanName = rawName.substring(rawName.indexOf("_") + 1);
                }

                String fileUrl = "/uploads/" + rawName;
                boolean exists = documentRepository.findAll().stream()
                        .anyMatch(doc -> doc.getFileUrl().equals(fileUrl));

                if (!exists) {
                    try {
                        Document doc = new Document();
                        doc.setFileName(cleanName);
                        doc.setFileUrl(fileUrl);
                        doc.setFileType(probeContentType(file));
                        doc.setSize(file.length());
                        doc.setUploadedAt(LocalDateTime.now());
                        doc.setOwner(defaultOwner.get());

                        documentRepository.save(doc);
                        count++;
                    } catch (Exception e) {
                        System.err.println("Kunde inte synka fil: " + rawName);
                    }
                }
            }
        }

        if (count > 0) {
            System.out.println("✅ FIL-SYNC: Hittade och registrerade " + count + " gamla filer i databasen!");
        }
    }

    private String probeContentType(File file) {
        try {
            return Files.probeContentType(file.toPath());
        } catch (IOException e) {
            return "application/octet-stream";
        }
    }
}