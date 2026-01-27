package com.eduflex.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeFile(MultipartFile file);

    java.io.InputStream getFileStream(String path);
}
