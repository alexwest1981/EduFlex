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
    private final TtsService ttsService;
    private final org.springframework.web.client.RestTemplate restTemplate;

    @org.springframework.beans.factory.annotation.Value("${core.service.url}")
    private String coreUrl;

    @Async
    public void processVideo(String fileId, String filePath) {
        // ... (existing code remains the same)
        log.info("Starting FFMPEG processing for {}", filePath);
        boolean isUrl = filePath.startsWith("http://") || filePath.startsWith("https://");
        if (isUrl) {
            filePath = filePath.replace("localhost:9000", "eduflex-minio:9000");
            filePath = filePath.replace("127.0.0.1:9000", "eduflex-minio:9000");
        }
        String thumbnailPath = "/tmp/thumb_" + fileId + ".jpg";
        try {
            ProcessBuilder pb = new ProcessBuilder("ffmpeg", "-y", "-i", filePath, "-ss", "00:00:01.000", "-vframes",
                    "1", thumbnailPath);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            process.waitFor();
        } catch (Exception e) {
            log.error("Processing failed", e);
        }
    }

    private String wrapText(String text, int maxChars) {
        if (text == null || text.length() <= maxChars)
            return text;
        StringBuilder sb = new StringBuilder();
        String[] words = text.split(" ");
        int lineLen = 0;
        for (String word : words) {
            if (lineLen + word.length() > maxChars) {
                sb.append("\n");
                lineLen = 0;
            }
            sb.append(word).append(" ");
            lineLen += word.length() + 1;
        }
        return sb.toString().trim();
    }

    @Async
    public void generateAiTutorVideo(String fileId, String scriptJson, String tenantId) {
        log.info("Generating AI Tutor video for fileId={}, tenantId={}", fileId, tenantId);
        java.util.List<String> tempFiles = new java.util.ArrayList<>();

        try {
            com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(scriptJson);
            String title = root.path("title").asText("AI Tutor Förklaring");
            com.fasterxml.jackson.databind.JsonNode scenes = root.path("scenes");

            if (!scenes.isArray() || scenes.size() == 0)
                return;

            String outputPath = "/tmp/ai_video_" + fileId + ".mp4";
            tempFiles.add(outputPath);

            String titleFilePath = "/tmp/title_" + fileId + ".txt";
            java.nio.file.Files.writeString(java.nio.file.Paths.get(titleFilePath), title);
            tempFiles.add(titleFilePath);

            StringBuilder videoFilter = new StringBuilder();
            StringBuilder audioFilter = new StringBuilder();

            videoFilter.append("drawtext=fontfile='/usr/share/fonts/ttf-dejavu/DejaVuSans-Bold.ttf':textfile='")
                    .append(titleFilePath).append("'")
                    .append(":fontcolor=white:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2")
                    .append(":box=1:boxcolor=black@0.5:boxborderw=20")
                    .append(":enable='between(t,0,3)'");

            double currentTime = 3.0;
            int sceneIndex = 0;
            for (com.fasterxml.jackson.databind.JsonNode scene : scenes) {
                String text = scene.path("text").asText("");
                double duration = scene.path("duration").asDouble(5.0);

                // Wrap text for better visibility
                String wrappedText = wrapText(text, 50);

                String sceneFilePath = "/tmp/scene_" + fileId + "_" + sceneIndex + ".txt";
                java.nio.file.Files.writeString(java.nio.file.Paths.get(sceneFilePath), wrappedText);
                tempFiles.add(sceneFilePath);

                videoFilter.append(",drawtext=fontfile='/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf':textfile='")
                        .append(sceneFilePath).append("'")
                        .append(":fontcolor=white:fontsize=32:x=60:y=h-th-100")
                        .append(":box=1:boxcolor=black@0.6:boxborderw=12:line_spacing=10")
                        .append(":enable='between(t,")
                        .append(currentTime).append(",").append(currentTime + duration).append("')");

                // TTS Generation
                byte[] audio = ttsService.generateSpeech(text, "nova");
                if (audio != null) {
                    String audioPath = "/tmp/audio_" + fileId + "_" + sceneIndex + ".mp3";
                    java.nio.file.Files.write(java.nio.file.Paths.get(audioPath), audio);
                    tempFiles.add(audioPath);

                    // Add audio to filter with delay
                    audioFilter.append("[").append(sceneIndex + 1).append(":a]adelay=")
                            .append((int) (currentTime * 1000)).append("|")
                            .append((int) (currentTime * 1000)).append("[a").append(sceneIndex).append("];");
                }

                currentTime += duration;
                sceneIndex++;
            }

            int totalDuration = (int) Math.ceil(currentTime);
            java.util.List<String> command = new java.util.ArrayList<>();
            command.add("ffmpeg");
            command.add("-y");

            // Input 0: Background
            command.add("-f");
            command.add("lavfi");
            command.add("-i");
            command.add("color=c=0x06141b:s=1280x720:d=" + totalDuration);

            // Inputs for audio
            for (int i = 0; i < sceneIndex; i++) {
                String ap = "/tmp/audio_" + fileId + "_" + i + ".mp3";
                if (new java.io.File(ap).exists()) {
                    command.add("-i");
                    command.add(ap);
                } else {
                    // Fallback to silent source if TTS failed for one scene
                    command.add("-f");
                    command.add("lavfi");
                    command.add("-i");
                    command.add("anullsrc=d=0.1");
                }
            }

            // Build complex filter for audio mixing
            StringBuilder complexFilter = new StringBuilder();
            complexFilter.append(audioFilter);
            for (int i = 0; i < sceneIndex; i++) {
                complexFilter.append("[a").append(i).append("]");
            }
            complexFilter.append("amix=inputs=").append(sceneIndex).append(":normalize=0[aout]");

            command.add("-filter_complex");
            command.add("[0:v]" + videoFilter.toString() + "[vout];" + complexFilter.toString());

            command.add("-map");
            command.add("[vout]");
            command.add("-map");
            command.add("[aout]");
            command.add("-c:v");
            command.add("libx264");
            command.add("-pix_fmt");
            command.add("yuv420p");
            command.add("-c:a");
            command.add("aac");
            command.add("-shortest");
            command.add(outputPath);

            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    log.info("FFMPEG: {}", line);
                }
            }

            if (process.waitFor() == 0) {
                log.info("AI Video generated successfully");
                File videoFile = new File(outputPath);
                String destinationPath = "ai-videos/" + fileId + "_" + java.util.UUID.randomUUID() + ".mp4";
                minioService.uploadFile(videoFile, destinationPath, "video/mp4");
                String publicVideoUrl = minioService.verifyAndGetPublicUrl(destinationPath);

                java.util.Map<String, Object> payload = java.util.Map.of("fileId", fileId, "videoUrl", publicVideoUrl,
                        "status", "SUCCESS", "tenantId", tenantId != null ? tenantId : "");
                org.springframework.http.HttpHeaders h = new org.springframework.http.HttpHeaders();
                h.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
                if (tenantId != null)
                    h.set("X-Tenant-ID", tenantId);
                restTemplate.postForEntity(coreUrl + "/api/ai-tutor/video-callback",
                        new org.springframework.http.HttpEntity<>(payload, h), Void.class);
            }
        } catch (Exception e) {
            log.error("AI Video generation failed", e);
        } finally {
            for (String p : tempFiles) {
                try {
                    new File(p).delete();
                } catch (Exception e) {
                }
            }
        }
    }
}
