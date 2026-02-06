package com.eduflex.backend.service;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.SetBucketPolicyArgs;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.util.UUID;

@Service
@org.springframework.context.annotation.Profile("!test")
@org.springframework.context.annotation.Primary
public class MinioStorageService implements StorageService {

    private static final Logger logger = LoggerFactory.getLogger(MinioStorageService.class);
    private final MinioClient minioClient;
    private final String bucketName;
    private final String publicUrl;

    public MinioStorageService(
            @Value("${minio.url}") String url,
            @Value("${minio.public-url}") String publicUrl,
            @Value("${minio.access-key}") String accessKey,
            @Value("${minio.secret-key}") String secretKey,
            @Value("${minio.bucket}") String bucketName) {
        this.publicUrl = publicUrl;
        this.bucketName = bucketName;
        this.minioClient = MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .build();

        try {
            if (!minioClient.bucketExists(io.minio.BucketExistsArgs.builder().bucket(bucketName).build())) {
                minioClient.makeBucket(io.minio.MakeBucketArgs.builder().bucket(bucketName).build());
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
            return minioClient.getObject(
                    io.minio.GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(storageId)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Read failed: " + storageId, e);
        }
    }

    @Override
    public void delete(String storageId) {
        try {
            minioClient.removeObject(
                    io.minio.RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(storageId)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Delete failed: " + storageId, e);
        }
    }
}
