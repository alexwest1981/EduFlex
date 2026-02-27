package com.eduflex.video.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class VideoEventListener {

    private final ObjectMapper objectMapper;
    private final VideoInternalService videoService;

    public void receiveMessage(String message) {
        log.info("Received <" + message + ">");
        try {
            @SuppressWarnings("unchecked")
            Map<String, String> event = objectMapper.readValue(message, Map.class);
            String action = event.get("action");
            String path = event.get("path");
            String fileId = event.get("fileId");

            if ("PROCESS_VIDEO".equals(action)) {
                log.info("Processing video fileId={} from path={}", fileId, path);
                videoService.processVideo(fileId, path);
            } else if ("GENERATE_AI_VIDEO".equals(action)) {
                String script = event.get("script");
                String tenantId = event.get("tenantId");
                log.info("Generating AI Video for fileId={} (Tenant: {})", fileId, tenantId);
                videoService.generateAiTutorVideo(fileId, script, tenantId);
            }
        } catch (IOException e) {
            log.error("Error parsing message", e);
        }
    }
}
