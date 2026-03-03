package com.eduflex.video.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;

@Service
@Slf4j
public class MinioService {

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

    /**
     * Laddar upp en fil till MinIO.
     * Returnerar den interna objektsökvägen, INTE en publik URL.
     * Använd verifyAndGetPublicUrl() för att verifiera och hämta slutlig URL.
     */
    public String uploadFile(File file, String destinationPath, String contentType) {
        try {
            try (FileInputStream fis = new FileInputStream(file)) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucket)
                                .object(destinationPath)
                                .stream(fis, file.length(), -1)
                                .contentType(contentType)
                                .build());
            }
            log.info("Successfully uploaded {} to MinIO as {}", file.getName(), destinationPath);
            return destinationPath; // Returnera bara sökvägen, inte URL:en
        } catch (Exception e) {
            log.error("Failed to upload file to MinIO", e);
            throw new RuntimeException("MinIO upload failed", e);
        }
    }

    /**
     * Verify-before-store: Bekräftar att filen faktiskt existerar i MinIO via
     * statObject,
     * och returnerar sedan den publika URL:en som ska sparas i databasen.
     * Kastar ett undantag om filen inte hittas, för att förhindra att ogiltiga URLs
     * sparas.
     */
    public String verifyAndGetPublicUrl(String destinationPath) {
        try {
            // Verifiera att filen faktiskt finns i MinIO
            StatObjectResponse stat = minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucket)
                            .object(destinationPath)
                            .build());

            long fileSize = stat.size();
            log.info("✅ Verified file exists in MinIO: {} ({} bytes)", destinationPath, fileSize);

            if (fileSize == 0) {
                throw new RuntimeException("File uploaded but has 0 bytes: " + destinationPath);
            }

            // Bygg publik URL
            if (publicUrl != null && !publicUrl.isBlank()) {
                return publicUrl + "/" + bucket + "/" + destinationPath;
            }
            // Fallback: intern API-sökväg (utan .mp4 om Cloudflare blockerar)
            return "/api/storage/" + destinationPath;

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ File verification failed in MinIO for path: {}", destinationPath, e);
            throw new RuntimeException("MinIO file verification failed: " + e.getMessage(), e);
        }
    }
}
