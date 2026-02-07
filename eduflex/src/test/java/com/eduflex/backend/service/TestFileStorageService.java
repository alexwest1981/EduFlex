package com.eduflex.backend.service;

import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.io.ByteArrayInputStream;

@Service
@Primary
@Profile("test")
public class TestFileStorageService implements StorageService {

    @Override
    public String save(MultipartFile file) {
        return "test-storage-id-" + file.getOriginalFilename();
    }

    @Override
    public String save(InputStream data, String contentType, String originalName) {
        return "test-storage-id-" + originalName;
    }

    @Override
    public String save(InputStream data, String contentType, String originalName, String customId) {
        return customId;
    }

    @Override
    public InputStream load(String storageId) {
        return new ByteArrayInputStream("test content".getBytes());
    }

    @Override
    public void delete(String storageId) {
        // No-op for test implementation
    }

    @Override
    public void deleteByPrefix(String prefix) {
        // No-op for test implementation
    }
}
