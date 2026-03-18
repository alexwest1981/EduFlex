package com.eduflex.backend.service;

import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpoPushService {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    /**
     * Skickar en push-notis till en specifik användare via Expo.
     */
    @Async
    public void sendPush(Long userId, String title, String body, Map<String, Object> data) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty())
            return;

        User user = userOpt.get();
        String token = user.getExpoPushToken();

        if (token == null || token.isEmpty()) {
            log.debug("Skipping push: User {} has no expoPushToken", userId);
            return;
        }

        log.info("🚀 Skickar Expo Push till användare: {} (Token: {})", user.getUsername(), token);

        try {
            Map<String, Object> message = new HashMap<>();
            message.put("to", token);
            message.put("title", title);
            message.put("body", body);
            message.put("sound", "default");
            if (data != null) {
                message.put("data", data);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(message, headers);

            restTemplate.postForObject(EXPO_PUSH_URL, request, String.class);
            log.info("✅ Push skickad till Expo för användare {}", user.getUsername());

        } catch (Exception e) {
            log.error("❌ Misslyckades att skicka Expo Push för användare {}: {}", user.getUsername(), e.getMessage());
        }
    }
}
