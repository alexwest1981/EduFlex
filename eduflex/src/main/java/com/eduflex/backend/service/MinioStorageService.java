package com.eduflex.backend.service;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.SetBucketPolicyArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.util.UUID;

@Service
@Primary
@org.springframework.context.annotation.Profile("!test")
public class MinioStorageService implements FileStorageService {

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
            // Simplified init for now
            if (!minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build())) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }
        } catch (Exception e) {
            System.err.println("MinIO Init Error: " + e.getMessage());
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build());

            // Return relative URL for the proxy controller
            return "/api/files/" + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Store failed", e);
        }
    }

    @Override
    public java.io.InputStream getFileStream(String path) {
        try {
            String objectName = path;
            if (path.contains("/")) {
                objectName = path.substring(path.lastIndexOf("/") + 1);
            }
            return minioClient.getObject(
                    io.minio.GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Read failed", e);
        }
    }
}
