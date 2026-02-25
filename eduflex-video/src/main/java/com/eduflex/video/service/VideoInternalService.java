package com.eduflex.video.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;

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

    @Async
    public void generateAiTutorVideo(String fileId, String scriptJson) {
        log.info("Generating AI Tutor video for fileId={}", fileId);

        try {
            // Simplified script parsing (we assume it's valid JSON from Gemini)
            // In a real scenario, use Jackson to parse 'segments'
            // For now, let's create a 10-second demo video with the title

            String outputPath = "/tmp/ai_video_" + fileId + ".mp4";

            // Basic FFMPEG to create a video from a color block and add text
            // We use a dark blue background (#06141b) to match EduFlex theme
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y",
                    "-f", "lavfi", "-i", "color=c=0x06141b:s=1280x720:d=10",
                    "-vf",
                    "drawtext=text='AI Tutor: Lektion " + fileId
                            + "':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2",
                    "-c:v", "libx264", "-pix_fmt", "yuv420p",
                    outputPath);

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
            } else {
                log.error("AI Video generation failed with exit code {}", exitCode);
            }

        } catch (Exception e) {
            log.error("AI Video generation failed", e);
        }
    }
}
