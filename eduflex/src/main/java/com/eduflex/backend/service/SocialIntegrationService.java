package com.eduflex.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class SocialIntegrationService {

    private static final Logger logger = LoggerFactory.getLogger(SocialIntegrationService.class);
    private final RestTemplate restTemplate;

    public SocialIntegrationService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Send a notification to Slack via Webhook
     */
    public void sendSlackNotification(String webhookUrl, String message) {
        if (webhookUrl == null || webhookUrl.isEmpty())
            return;

        try {
            Map<String, String> payload = new HashMap<>();
            payload.put("text", message);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(webhookUrl, request, String.class);
            logger.info("Sent Slack notification: {}", message);
        } catch (Exception e) {
            logger.error("Failed to send Slack notification", e);
        }
    }

    /**
     * Send a notification to Microsoft Teams via Webhook (Adaptive Card style)
     */
    public void sendTeamsNotification(String webhookUrl, String title, String summary) {
        if (webhookUrl == null || webhookUrl.isEmpty())
            return;

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("@type", "MessageCard");
            payload.put("@context", "http://schema.org/extensions");
            payload.put("themeColor", "0076D7");
            payload.put("summary", summary);
            payload.put("title", title);
            payload.put("text", summary);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(webhookUrl, request, String.class);
            logger.info("Sent Teams notification: {}", title);
        } catch (Exception e) {
            logger.error("Failed to send Teams notification", e);
        }
    }

    /**
     * Notify social channels about new Community content
     */
    public void notifyNewContent(String title, String author, String type, String url) {
        String message = String.format(
                "🚀 *Nytt material i EduFlex Community!* \n\n*%s*\nTyp: %s\nSkapat av: %s\nKolla in det här: %s",
                title, type, author, url);

        // In a real implementation, we would fetch configured webhooks for the tenant
        // or global community
        // For MVP, we log and provide hooks for future configuration
        logger.info("Social Broadcast: {}", message);
    }
}
