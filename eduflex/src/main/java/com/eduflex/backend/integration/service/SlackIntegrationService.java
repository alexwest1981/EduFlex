package com.eduflex.backend.integration.service;

import com.eduflex.backend.integration.model.IntegrationConfig;
import com.eduflex.backend.integration.model.IntegrationLog;
import com.eduflex.backend.integration.repository.IntegrationConfigRepository;
import com.eduflex.backend.integration.repository.IntegrationLogRepository;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.repository.CourseRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlackIntegrationService {

    private final IntegrationConfigRepository configRepository;
    private final IntegrationLogRepository logRepository;
    private final CourseRepository courseRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String PLATFORM_NAME = "SLACK";

    public void sendCoursePublishedNotification(String courseName, String teacherName) {
        Optional<IntegrationConfig> configOpt = configRepository.findByPlatform(PLATFORM_NAME);

        if (configOpt.isEmpty() || !configOpt.get().isActive() || configOpt.get().getWebhookUrl() == null) {
            log.info("Slack integration is not active or missing webhook URL. Skipping notification for course: {}",
                    courseName);
            return;
        }

        IntegrationConfig config = configOpt.get();
        String webhookUrl = config.getWebhookUrl();

        Map<String, Object> payload = new HashMap<>();
        payload.put("text", "🚀 *Ny kurs publicerad!*\nKursen *" + courseName + "* har just publicerats av "
                + teacherName + ". Logga in i EduFlex för att se den!");

        logOutboundEvent("COURSE_PUBLISHED", payload, "PENDING", null);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(webhookUrl, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                logOutboundEvent("COURSE_PUBLISHED", payload, "SUCCESS", null);
                log.info("Successfully sent Slack notification for course: {}", courseName);
            } else {
                logOutboundEvent("COURSE_PUBLISHED", payload, "FAILED", "HTTP Status: " + response.getStatusCode());
                log.error("Failed to send Slack notification. Status: {}", response.getStatusCode());
            }
        } catch (RestClientException e) {
            logOutboundEvent("COURSE_PUBLISHED", payload, "FAILED", e.getMessage());
            log.error("Error sending Slack notification", e);
        }
    }

    public Map<String, Object> handleSlashCommand(Map<String, String> requestParams) {
        logInboundEvent("SLASH_COMMAND", requestParams, "SUCCESS", null);

        String command = requestParams.getOrDefault("command", "");
        String text = requestParams.getOrDefault("text", "").trim();

        Map<String, Object> response = new HashMap<>();

        if ("/eduflex".equals(command)) {
            if ("kurser".equalsIgnoreCase(text)) {
                response.put("response_type", "in_channel");

                try {
                    // Fetch active courses
                    java.util.List<Course> activeCourses = courseRepository.findByIsOpenTrue();

                    if (activeCourses.isEmpty()) {
                        response.put("text", "Det finns för närvarande inga publicerade kurser i EduFlex.");
                    } else {
                        StringBuilder sb = new StringBuilder("🎓 *Här är en lista på aktiva kurser i EduFlex:*\n\n");
                        for (Course course : activeCourses) {
                            sb.append("• *").append(course.getName()).append("*\n");
                            // Add a tiny bit of description if it exists
                            if (course.getDescription() != null && !course.getDescription().trim().isEmpty()) {
                                String desc = course.getDescription().replaceAll("<[^>]*>", "").trim(); // Strip HTML
                                if (desc.length() > 60) {
                                    desc = desc.substring(0, 57) + "...";
                                }
                                sb.append("  _").append(desc).append("_\n");
                            }
                        }
                        response.put("text", sb.toString());
                    }
                } catch (Exception e) {
                    log.error("Failed to fetch courses for Slack command", e);
                    response.put("text", "Ett fel uppstod när kurserna skulle hämtas. Vänligen försök igen senare.");
                }
            } else {
                response.put("text", "Kunde inte förstå kommandot. Prova `/eduflex kurser`.");
            }
        } else {
            response.put("text", "Okänt kommando.");
        }

        return response;
    }

    private void logOutboundEvent(String eventType, Object payload, String status, String errorMessage) {
        saveLog("OUTBOUND", eventType, payload, status, errorMessage);
    }

    private void logInboundEvent(String eventType, Object payload, String status, String errorMessage) {
        saveLog("INBOUND", eventType, payload, status, errorMessage);
    }

    private void saveLog(String direction, String eventType, Object payload, String status, String errorMessage) {
        try {
            IntegrationLog iLog = new IntegrationLog();
            iLog.setPlatform(PLATFORM_NAME);
            iLog.setDirection(direction);
            iLog.setEventType(eventType);
            iLog.setPayload(objectMapper.writeValueAsString(payload));
            iLog.setStatus(status);
            iLog.setErrorMessage(errorMessage);
            logRepository.save(iLog);
        } catch (Exception e) {
            log.error("Failed to save integration log", e);
        }
    }
}
