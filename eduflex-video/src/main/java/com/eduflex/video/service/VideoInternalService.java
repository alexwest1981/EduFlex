package com.eduflex.video.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class VideoInternalService {

    @Async
    public void processVideo(String fileId, String filePath) {
        log.info("Starting FFMPEG processing for {}", filePath);

        // Check if filePath is local or URL
        boolean isUrl = filePath.startsWith("http://") || filePath.startsWith("https://");

        if (isUrl) {
            // FIX: If running in Docker, localhost refers to the container itself, not the
            // host/minio.
            // We blindly replace localhost:9000 with eduflex-minio:9000 to ensure internal
            // access works.
            filePath = filePath.replace("localhost:9000", "eduflex-minio:9000");
            filePath = filePath.replace("127.0.0.1:9000", "eduflex-minio:9000");
            log.info("Adjusted URL for Docker network: {}", filePath);
        } else {
            File inputFile = new File(filePath);
            if (!inputFile.exists()) {
                log.error("File not found: {}", filePath);
                return;
            }
        }

        // Output thumbnail path (local temp)
        String thumbnailPath = "/tmp/thumb_" + fileId + ".jpg";

        try {
            // FFMPEG command to extract frame at 00:00:01
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y", "-i", filePath, "-ss", "00:00:01.000", "-vframes", "1", thumbnailPath);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            // Read output
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    log.debug(line);
                }
            }

            int exitCode = process.waitFor();
            if (exitCode == 0) {
                log.info("Thumbnail generated at {}", thumbnailPath);
                // TODO: Call back to Core to update DB status
            } else {
                log.error("FFMPEG failed with exit code {}", exitCode);
            }

        } catch (Exception e) {
            log.error("Processing failed", e);
        }
    }
}
