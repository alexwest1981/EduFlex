package com.eduflex.video.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;

@Service
@Slf4j
@lombok.RequiredArgsConstructor
public class VideoInternalService {

    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final MinioService minioService;
    private final org.springframework.web.client.RestTemplate restTemplate;

    @org.springframework.beans.factory.annotation.Value("${core.service.url}")
    private String coreUrl;

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

    @Async
    public void generateAiTutorVideo(String fileId, String scriptJson) {
        log.info("Generating AI Tutor video for fileId={}", fileId);

        try {
            com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(scriptJson);
            String title = root.path("title").asText("AI Tutor Förklaring");
            com.fasterxml.jackson.databind.JsonNode scenes = root.path("scenes");

            if (!scenes.isArray() || scenes.size() == 0) {
                log.warn("No scenes found in script for fileId={}", fileId);
                return;
            }

            String outputPath = "/tmp/ai_video_" + fileId + ".mp4";

            // Build FFMPEG filter for multiple scenes
            StringBuilder filter = new StringBuilder();
            // Start with title screen for 3 seconds
            filter.append("drawtext=text='").append(title)
                    .append("':fontcolor=white:fontsize=64:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,0,3)'");

            double currentTime = 3.0;
            for (com.fasterxml.jackson.databind.JsonNode scene : scenes) {
                String text = scene.path("text").asText("");
                double duration = scene.path("duration").asDouble(5.0);

                // Escape single quotes in text for FFMPEG
                String escapedText = text.replace("'", "\\'");

                filter.append(",drawtext=text='").append(escapedText)
                        .append("':fontcolor=white:fontsize=36:x=50:y=h-100:w=w-100:enable='between(t,")
                        .append(currentTime).append(",").append(currentTime + duration).append("')");

                currentTime += duration;
            }

            // Total duration
            int totalDuration = (int) Math.ceil(currentTime);

            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y",
                    "-f", "lavfi", "-i", "color=c=0x06141b:s=1280x720:d=" + totalDuration,
                    "-vf", filter.toString(),
                    "-c:v", "libx264", "-pix_fmt", "yuv420p",
                    outputPath);

            log.info("Running FFMPEG for AI video: duration={}s", totalDuration);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    log.debug(line);
                }
            }

            int exitCode = process.waitFor();
            if (exitCode == 0) {
                log.info("AI Video generated successfully at {}", outputPath);

                // 1. Upload to MinIO
                File videoFile = new File(outputPath);
                String destinationPath = "ai-videos/" + java.util.UUID.randomUUID() + ".mp4";
                String videoUrl = minioService.uploadFile(videoFile, destinationPath, "video/mp4");

                // 2. Notify Core
                java.util.Map<String, Object> callbackPayload = new java.util.HashMap<>();
                callbackPayload.put("fileId", fileId);
                callbackPayload.put("videoUrl", videoUrl);
                callbackPayload.put("status", "SUCCESS");

                String callbackUrl = coreUrl + "/api/ai-tutor/video-callback";
                log.info("Sending callback to Core: {}", callbackUrl);
                restTemplate.postForEntity(callbackUrl, callbackPayload, Void.class);

                // Clean up local temp file
                if (videoFile.delete()) {
                    log.info("Deleted local temp video file: {}", outputPath);
                }
            } else {
                log.error("AI Video generation failed with exit code {}", exitCode);
                // Notify Core of failure
                java.util.Map<String, Object> callbackPayload = new java.util.HashMap<>();
                callbackPayload.put("fileId", fileId);
                callbackPayload.put("status", "FAILED");
                restTemplate.postForEntity(coreUrl + "/api/ai-tutor/video-callback", callbackPayload, Void.class);
            }

        } catch (Exception e) {
            log.error("AI Video generation failed", e);
        }
    }
}
