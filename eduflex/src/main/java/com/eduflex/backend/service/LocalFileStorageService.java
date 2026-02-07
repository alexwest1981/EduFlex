package com.eduflex.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@org.springframework.context.annotation.Profile("!test")
public class LocalFileStorageService implements StorageService {

    private final Path fileStorageLocation;

    public LocalFileStorageService(
            @org.springframework.beans.factory.annotation.Value("${file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Kunde inte skapa mappen för uppladdade filer.", ex);
        }
    }

    @Override
    public String save(MultipartFile file) {
        try {
            return save(file.getInputStream(), file.getContentType(), file.getOriginalFilename());
        } catch (Exception e) {
            throw new RuntimeException("Save failed", e);
        }
    }

    @Override
    public String save(InputStream data, String contentType, String originalName) {
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String storageId = UUID.randomUUID().toString() + extension;
        return save(data, contentType, originalName, storageId);
    }

    @Override
    public String save(InputStream data, String contentType, String originalName, String customId) {
        try {
            Path targetLocation = this.fileStorageLocation.resolve(customId);
            if (targetLocation.getParent() != null) {
                Files.createDirectories(targetLocation.getParent());
            }
            Files.copy(data, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return customId;
        } catch (IOException ex) {
            throw new RuntimeException("Kunde inte spara filen " + customId, ex);
        }
    }

    @Override
    public InputStream load(String storageId) {
        try {
            Path filePath = this.fileStorageLocation.resolve(storageId).normalize();
            if (!Files.exists(filePath)) {
                throw new java.io.FileNotFoundException("File not found: " + storageId);
            }
            return Files.newInputStream(filePath);
        } catch (Exception e) {
            throw new RuntimeException("Could not read file: " + storageId, e);
        }
    }

    @Override
    public void delete(String storageId) {
        try {
            Path filePath = this.fileStorageLocation.resolve(storageId).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete file: " + storageId, e);
        }
    }

    @Override
    public void deleteByPrefix(String prefix) {
        try {
            Path prefixPath = this.fileStorageLocation.resolve(prefix).normalize();
            if (Files.exists(prefixPath) && Files.isDirectory(prefixPath)) {
                // Simplified recursive delete for directories
                try (java.util.stream.Stream<Path> walk = Files.walk(prefixPath)) {
                    walk.sorted(java.util.Comparator.reverseOrder())
                            .forEach(path -> {
                                try {
                                    Files.delete(path);
                                } catch (IOException e) {
                                    // ignore
                                }
                            });
                }
            } else {
                Files.deleteIfExists(prefixPath);
            }
        } catch (Exception e) {
            throw new RuntimeException("Could not delete by prefix: " + prefix, e);
        }
    }
}
