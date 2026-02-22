package com.eduflex.backend.integration.controller;

import com.eduflex.backend.integration.service.SlackIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks/slack")
@RequiredArgsConstructor
@Slf4j
public class SlackWebhookController {

    private final SlackIntegrationService slackIntegrationService;

    /**
     * Endpoint for receiving Slack Slash Commands (e.g., /eduflex kurser)
     * Slack sends data as application/x-www-form-urlencoded
     */
    @PostMapping(value = "/command", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<Map<String, Object>> handleSlackCommand(@RequestParam Map<String, String> payload) {
        log.info("Received Slack command payload: {}", payload);

        try {
            Map<String, Object> response = slackIntegrationService.handleSlashCommand(payload);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing Slack command", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
