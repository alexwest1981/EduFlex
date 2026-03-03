package com.eduflex.scorm.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service
public class MinioService {

    private static final Logger log = LoggerFactory.getLogger(MinioService.class);

    private final MinioClient minioClient;
    private final String bucket;
    private final String publicUrl;

    public MinioService(
            @Value("${minio.url}") String url,
            @Value("${minio.access-key}") String accessKey,
            @Value("${minio.secret-key}") String secretKey,
            @Value("${minio.bucket}") String bucket,
            @Value("${minio.public-url:}") String publicUrl) {
        this.bucket = bucket;
        this.publicUrl = publicUrl;
        this.minioClient = MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .build();
    }

    public void uploadFile(InputStream inputStream, long size, String destinationPath, String contentType) {
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(destinationPath)
                            .stream(inputStream, size, -1)
                            .contentType(contentType)
                            .build());
            log.debug("Uploaded to MinIO: {}", destinationPath);
        } catch (Exception e) {
            log.error("Failed to upload to MinIO: {}", destinationPath, e);
            throw new RuntimeException("MinIO upload failed", e);
        }
    }

    public String verifyAndGetPublicUrl(String destinationPath) {
        try {
            StatObjectResponse stat = minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucket)
                            .object(destinationPath)
                            .build());

            if (stat.size() == 0) {
                throw new RuntimeException("File is 0 bytes: " + destinationPath);
            }

            if (publicUrl != null && !publicUrl.isBlank()) {
                return publicUrl + "/" + bucket + "/" + destinationPath;
            }
            return "/api/storage/" + destinationPath;
        } catch (Exception e) {
            log.error("MinIO verification failed: {}", destinationPath, e);
            throw new RuntimeException("MinIO verification failed", e);
        }
    }
}
