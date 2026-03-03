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
                    log.info("FFMPEG: {}", line);
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
    public void generateAiTutorVideo(String fileId, String scriptJson, String tenantId) {
        log.info("Generating AI Tutor video for fileId={}, tenantId={}", fileId, tenantId);

        try {
            com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(scriptJson);
            String title = root.path("title").asText("AI Tutor Förklaring");
            com.fasterxml.jackson.databind.JsonNode scenes = root.path("scenes");

            if (!scenes.isArray() || scenes.size() == 0) {
                log.warn("No scenes found in script for fileId={}", fileId);
                return;
            }

            String outputPath = "/tmp/ai_video_" + fileId + ".mp4";

            // Write title to temp file to avoid escaping issues
            String titleFilePath = "/tmp/title_" + fileId + ".txt";
            java.nio.file.Files.writeString(java.nio.file.Paths.get(titleFilePath), title,
                    java.nio.charset.StandardCharsets.UTF_8);

            // Build FFMPEG filter for multiple scenes
            StringBuilder filter = new StringBuilder();
            // Titelbild i mitten av skärmen under 3 sekunder
            filter.append("drawtext=fontfile='/usr/share/fonts/ttf-dejavu/DejaVuSans-Bold.ttf':textfile='")
                    .append(titleFilePath).append("'")
                    .append(":fontcolor=white:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2")
                    .append(":box=1:boxcolor=black@0.5:boxborderw=20")
                    .append(":enable='between(t,0,3)'");

            double currentTime = 3.0;
            int sceneIndex = 0;
            for (com.fasterxml.jackson.databind.JsonNode scene : scenes) {
                String text = scene.path("text").asText("");
                double duration = scene.path("duration").asDouble(5.0);

                // Write text to temp file
                String sceneFilePath = "/tmp/scene_" + fileId + "_" + sceneIndex + ".txt";
                java.nio.file.Files.writeString(java.nio.file.Paths.get(sceneFilePath), text,
                        java.nio.charset.StandardCharsets.UTF_8);

                // FIX: y=h-th-80 anpassar sig dynamiskt till texthöjden + marginal nedtill.
                // box+boxcolor ger en halvtransparent bakgrund så texten alltid syns.
                // x=60 ger lite marginal från vänster.
                filter.append(",drawtext=fontfile='/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf':textfile='")
                        .append(sceneFilePath).append("'")
                        .append(":fontcolor=white:fontsize=32")
                        .append(":x=60:y=h-th-80")
                        .append(":box=1:boxcolor=black@0.6:boxborderw=12")
                        .append(":line_spacing=8")
                        .append(":enable='between(t,")
                        .append(currentTime).append(",").append(currentTime + duration).append("')");

                currentTime += duration;
                sceneIndex++;
            }

            // Total duration
            int totalDuration = (int) Math.ceil(currentTime);

            // FIX: Lägger till en tyst audio-stream via anullsrc.
            // Utan ett audio-track kan vissa spelare vägra spela eller visa tyst som bugg.
            // anullsrc genererar tystnad, -shortest avslutar när video-streamen tar slut.
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y",
                    "-f", "lavfi", "-i", "color=c=0x06141b:s=1280x720:d=" + totalDuration,
                    "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
                    "-vf", filter.toString(),
                    "-c:v", "libx264", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "128k",
                    "-shortest",
                    outputPath);

            log.info("Running FFMPEG for AI video: duration={}s", totalDuration);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    log.info("FFMPEG: {}", line);
                }
            }

            int exitCode = process.waitFor();
            if (exitCode == 0) {
                log.info("AI Video generated successfully at {}", outputPath);

                // STEG 1: Ladda upp till MinIO
                File videoFile = new File(outputPath);
                String destinationPath = "ai-videos/" + fileId + "_" + java.util.UUID.randomUUID() + ".mp4";
                minioService.uploadFile(videoFile, destinationPath, "video/mp4");

                // STEG 2: Verify-before-store — bekräfta att filen verkligen finns innan
                // vi skapar en kurspost med URL:en. Förhindrar 404-videos för elever.
                String publicVideoUrl = minioService.verifyAndGetPublicUrl(destinationPath);
                log.info("✅ Video verified in MinIO, public URL: {}", publicVideoUrl);

                // STEG 3: Skicka callback med bekräftad URL
                java.util.Map<String, Object> callbackPayload = new java.util.HashMap<>();
                callbackPayload.put("fileId", fileId);
                callbackPayload.put("videoUrl", publicVideoUrl);
                callbackPayload.put("status", "SUCCESS");
                callbackPayload.put("tenantId", tenantId);

                String callbackUrl = coreUrl + "/api/ai-tutor/video-callback";
                log.info("Sending callback to Core (Tenant: {}): {}", tenantId, callbackUrl);

                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
                if (tenantId != null) {
                    headers.set("X-Tenant-ID", tenantId);
                }
                org.springframework.http.HttpEntity<java.util.Map<String, Object>> requestEntity = new org.springframework.http.HttpEntity<>(
                        callbackPayload, headers);

                restTemplate.postForEntity(callbackUrl, requestEntity, Void.class);

                // STEG 4: Rensa lokala tempfiler
                if (videoFile.delete()) {
                    log.info("Deleted local temp video file: {}", outputPath);
                }
            } else {
                log.error("AI Video generation failed with exit code {}", exitCode);
                // Notify Core of failure
                java.util.Map<String, Object> callbackPayload = new java.util.HashMap<>();
                callbackPayload.put("fileId", fileId);
                callbackPayload.put("status", "FAILED");
                callbackPayload.put("tenantId", tenantId);
                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
                if (tenantId != null) {
                    headers.set("X-Tenant-ID", tenantId);
                }
                org.springframework.http.HttpEntity<java.util.Map<String, Object>> requestEntity = new org.springframework.http.HttpEntity<>(
                        callbackPayload, headers);
                restTemplate.postForEntity(coreUrl + "/api/ai-tutor/video-callback", requestEntity, Void.class);
            }

        } catch (Exception e) {
            log.error("AI Video generation failed", e);
        }
    }
}
