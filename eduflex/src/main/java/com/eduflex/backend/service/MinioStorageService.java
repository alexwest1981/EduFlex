package com.eduflex.backend.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectsArgs;
import io.minio.messages.DeleteObject;
import io.minio.ListObjectsArgs;
import io.minio.Result;
import io.minio.messages.Item;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@org.springframework.context.annotation.Profile("!test")
@org.springframework.context.annotation.Primary
public class MinioStorageService implements StorageService {

    private static final Logger logger = LoggerFactory.getLogger(MinioStorageService.class);
    private final MinioClient minioClient;
    private final String bucketName;
    private final String uploadDir;

    public MinioStorageService(
            @Value("${minio.url}") String url,
            @Value("${minio.access-key}") String accessKey,
            @Value("${minio.secret-key}") String secretKey,
            @Value("${minio.bucket}") String bucketName,
            @Value("${file.upload-dir:uploads}") String uploadDir) {

        this.bucketName = bucketName;
        this.uploadDir = uploadDir;
        this.minioClient = MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .build();

        logger.info("MinIO Storage Service initialized: URL={}, Bucket={}", url, bucketName);

        try {
            if (!minioClient.bucketExists(io.minio.BucketExistsArgs.builder().bucket(bucketName).build())) {
                minioClient.makeBucket(io.minio.MakeBucketArgs.builder().bucket(bucketName).build());
            }

            // DEBUG: List objects in bucket
            Iterable<io.minio.Result<io.minio.messages.Item>> results = minioClient.listObjects(
                    io.minio.ListObjectsArgs.builder().bucket(bucketName).build());
            logger.info("Listing objects in bucket '{}':", bucketName);
            for (io.minio.Result<io.minio.messages.Item> result : results) {
                logger.info(" - Found object: {}", result.get().objectName());
            }

        } catch (Exception e) {
            logger.error("MinIO Init Error: {}", e.getMessage());
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
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(customId)
                            .stream(data, -1, 10 * 1024 * 1024)
                            .contentType(contentType)
                            .build());

            return customId;
        } catch (Exception e) {
            throw new RuntimeException("Store failed", e);
        }
    }

    @Override
    public InputStream load(String storageId) {
        try {
            // FIX: Strip common path prefixes to find the actual key/filename
            String key = storageId;
            String[] prefixes = { "/uploads/", "uploads/", "/api/storage/", "api/storage/", "/api/files/", "api/files/",
                    "/api/onlyoffice/download/" };
            for (String prefix : prefixes) {
                if (key.startsWith(prefix)) {
                    key = key.substring(prefix.length());
                    break;
                }
            }

            logger.info("Attempting to load object '{}' (original: '{}') from bucket '{}'", key, storageId, bucketName);
            return minioClient.getObject(
                    io.minio.GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(key)
                            .build());
        } catch (Exception e) {
            // Lazy Sync: Try to recover from local uploads if available
            try {
                // Use injected uploadDir
                // Try to find the file locally using the original storageId (which might be a
                // path) or just the filename
                String filename = storageId;
                if (filename.contains("/")) {
                    filename = filename.substring(filename.lastIndexOf("/") + 1);
                }

                java.nio.file.Path localPath = java.nio.file.Paths.get(uploadDir, "profiles", filename);
                if (!java.nio.file.Files.exists(localPath)) {
                    localPath = java.nio.file.Paths.get(uploadDir, "materials", filename);
                }
                if (!java.nio.file.Files.exists(localPath)) {
                    localPath = java.nio.file.Paths.get(uploadDir, "documents", filename);
                }
                if (!java.nio.file.Files.exists(localPath)) {
                    localPath = java.nio.file.Paths.get(uploadDir, "attachments", filename);
                }
                // Also check root of uploadDir
                if (!java.nio.file.Files.exists(localPath)) {
                    localPath = java.nio.file.Paths.get(uploadDir, filename);
                }

                if (java.nio.file.Files.exists(localPath)) {
                    logger.info("Lazy Sync: Found missing object '{}' in local uploads ({}). Uploading to MinIO...",
                            storageId, localPath.toAbsolutePath());
                    String contentType = java.net.URLConnection.guessContentTypeFromName(storageId);
                    if (contentType == null)
                        contentType = "application/octet-stream";

                    // Use the cleaned key for MinIO
                    String key = storageId;
                    if (key.startsWith("/uploads/")) {
                        key = key.substring("/uploads/".length());
                    } else if (key.startsWith("uploads/")) {
                        key = key.substring("uploads/".length());
                    }

                    try (InputStream is = java.nio.file.Files.newInputStream(localPath)) {
                        save(is, contentType, storageId, key);
                    }

                    // Try loading again
                    return minioClient.getObject(
                            io.minio.GetObjectArgs.builder()
                                    .bucket(bucketName)
                                    .object(key)
                                    .build());
                } else {
                    logger.warn(
                            "Lazy Sync: Object '{}' not found in local uploads (searched in profiles and materials)",
                            storageId);
                }
            } catch (Exception inner) {
                logger.error("Lazy Sync failed for '{}': {}", storageId, inner.getMessage());
            }

            logger.error("Load failed for '{}': {}", storageId, e.getMessage());
            throw new RuntimeException("Read failed: " + storageId, e);
        }
    }

    @Override
    public void delete(String storageId) {
        try {
            String key = storageId;
            if (key.startsWith("/uploads/")) {
                key = key.substring("/uploads/".length());
            } else if (key.startsWith("uploads/")) {
                key = key.substring("uploads/".length());
            }

            minioClient.removeObject(
                    io.minio.RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(key)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Delete failed: " + storageId, e);
        }
    }

    @Override
    public void deleteByPrefix(String prefix) {
        try {
            Iterable<Result<Item>> results = minioClient.listObjects(
                    ListObjectsArgs.builder()
                            .bucket(bucketName)
                            .prefix(prefix)
                            .recursive(true)
                            .build());

            List<DeleteObject> objectsToDelete = new ArrayList<>();
            for (Result<Item> result : results) {
                objectsToDelete.add(new DeleteObject(result.get().objectName()));
            }

            if (!objectsToDelete.isEmpty()) {
                minioClient.removeObjects(
                        RemoveObjectsArgs.builder()
                                .bucket(bucketName)
                                .objects(objectsToDelete)
                                .build());
                logger.info("Deleted {} objects with prefix: {}", objectsToDelete.size(), prefix);
            }
        } catch (Exception e) {
            throw new RuntimeException("Delete prefix failed: " + prefix, e);
        }
    }
}
