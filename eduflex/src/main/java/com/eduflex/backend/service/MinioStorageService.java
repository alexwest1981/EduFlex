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
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }

            // Always set public read policy
            String policy = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"AWS\":[\"*\"]},\"Action\":[\"s3:GetObject\"],\"Resource\":[\"arn:aws:s3:::"
                    + bucketName + "/*\"]}]}";
            minioClient.setBucketPolicy(
                    SetBucketPolicyArgs.builder().bucket(bucketName).config(policy).build());
        } catch (Exception e) {
            // throw new RuntimeException("Could not initialize MinIO storage", e);
            System.err.println("WARNING: Could not initialize MinIO storage (is MinIO running?): " + e.getMessage());
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + fileExtension;

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build());
            // Return full public URL to the file (uses HTTPS in production)
            return publicUrl + "/" + bucketName + "/" + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Could not store file " + fileName + " in MinIO", e);
        }
    }

    @Override
    public java.io.InputStream getFileStream(String path) {
        try {
            // Extract object name from URL
            // Path is usually publicUrl/bucketName/fileName
            // Or just fileName if simplistic logic used somewhere else.

            String objectName = path;

            // Try 1: After last slash
            if (path.contains("/")) {
                objectName = path.substring(path.lastIndexOf("/") + 1);
            }

            // Try 2: If we want to be stricter, verify bucket name in path?
            // But UUID filenames are unique enough usually.

            return minioClient.getObject(
                    io.minio.GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Could not read file from MinIO: " + path, e);
        }
    }
}
