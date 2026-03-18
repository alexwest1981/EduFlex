package com.eduflex.scorm.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class StatusCallbackService {

    private static final Logger log = LoggerFactory.getLogger(StatusCallbackService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${eduflex.core.url:http://localhost:8080}")
    private String coreUrl;

    public void notifyProgress(String actorEmail, String objectId, String verbId, String registration,
            String rawStatement) {
        String callbackUrl = coreUrl + "/api/internal/progress-update";

        Map<String, Object> payload = new HashMap<>();
        payload.put("actorEmail", actorEmail);
        payload.put("objectId", objectId);
        payload.put("verbId", verbId);
        payload.put("registration", registration);
        payload.put("rawStatement", rawStatement);

        try {
            log.info("Sending progress callback to Core: {} for {}", verbId, actorEmail);
            restTemplate.postForEntity(callbackUrl, payload, Void.class);
        } catch (Exception e) {
            log.error("Failed to send progress callback to Core", e);
            // In a production system, we would retry or use a dead-letter queue
        }
    }
}
