package com.eduflex.backend.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;

public interface StorageService {
    /**
     * Store a file and return a unique storageId (UUID).
     */
    String save(MultipartFile file);

    /**
     * Store a file from an input stream and return a unique storageId (UUID).
     */
    String save(InputStream data, String contentType, String originalName);

    /**
     * Store a file with a specific custom storageId (useful for maintaining path
     * structures).
     */
    String save(InputStream data, String contentType, String originalName, String customId);

    /**
     * Load a file as an input stream by its storageId.
     */
    InputStream load(String storageId);

    /**
     * Delete a file by its storageId.
     */
    void delete(String storageId);

    /**
     * Delete all files starting with a specific prefix.
     */
    void deleteByPrefix(String prefix);

    /**
     * Compatibility bridge: deprecated, use save(MultipartFile) instead.
     */
    @Deprecated
    default String storeFile(MultipartFile file) {
        return save(file);
    }

    /**
     * Compatibility bridge: deprecated, use load(String) instead.
     */
    @Deprecated
    default InputStream getFileStream(String path) {
        return load(path);
    }
}
