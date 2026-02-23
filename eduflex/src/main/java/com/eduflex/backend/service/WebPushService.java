package com.eduflex.backend.service;

import com.eduflex.backend.model.WebPushSubscription;
import com.eduflex.backend.repository.WebPushSubscriptionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.security.Security;
import java.util.List;
import java.util.Map;

@Service
public class WebPushService {

    private static final Logger logger = LoggerFactory.getLogger(WebPushService.class);

    private final WebPushSubscriptionRepository subscriptionRepository;
    private final ObjectMapper objectMapper;
    private PushService pushService;

    @Value("${eduflex.webpush.public-key}")
    private String publicKey;

    @Value("${eduflex.webpush.private-key}")
    private String privateKey;

    @Value("${eduflex.webpush.subject}")
    private String subject;

    public WebPushService(WebPushSubscriptionRepository subscriptionRepository, ObjectMapper objectMapper) {
        this.subscriptionRepository = subscriptionRepository;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        Security.addProvider(new BouncyCastleProvider());
        try {
            // We only initialize if keys are present and not placeholders
            if (publicKey != null && !publicKey.contains("...") && privateKey != null && !privateKey.contains("...")) {
                this.pushService = new PushService(publicKey, privateKey, subject);
                logger.info("WebPushService initialized with VAPID key");
            } else {
                logger.warn("WebPushService NOT initialized: Missing or invalid VAPID keys");
            }
        } catch (Exception e) {
            logger.error("Failed to initialize WebPushService: {}", e.getMessage());
        }
    }

    public String getPublicKey() {
        return publicKey;
    }

    public void subscribe(Long userId, String endpoint, String p256dh, String auth) {
        subscriptionRepository.findByEndpoint(endpoint).ifPresentOrElse(
                existing -> {
                    existing.setUserId(userId);
                    existing.setP256dh(p256dh);
                    existing.setAuth(auth);
                    subscriptionRepository.save(existing);
                },
                () -> subscriptionRepository.save(new WebPushSubscription(userId, endpoint, p256dh, auth)));
    }

    @Transactional
    public void unsubscribe(String endpoint) {
        subscriptionRepository.deleteByEndpoint(endpoint);
    }

    /**
     * Skickar en notis till en specifik användare via alla deras enheter.
     */
    @Async
    public void sendPushNotification(Long userId, String title, String body, String url) {
        if (pushService == null) {
            logger.warn("Cannot send WebPush: Service not initialized");
            return;
        }

        List<WebPushSubscription> subscriptions = subscriptionRepository.findByUserId(userId);
        if (subscriptions.isEmpty()) {
            return;
        }

        Map<String, Object> payloadMap = Map.of(
                "notification", Map.of(
                        "title", title,
                        "body", body,
                        "data", Map.of("url", url != null ? url : "/"),
                        "icon", "/logo.png",
                        "badge", "/badge.png"));

        try {
            String payload = objectMapper.writeValueAsString(payloadMap);
            for (WebPushSubscription sub : subscriptions) {
                sendNotification(sub, payload);
            }
        } catch (Exception e) {
            logger.error("Failed to prepare WebPush payload: {}", e.getMessage());
        }
    }

    private void sendNotification(WebPushSubscription sub, String payload) {
        try {
            Notification notification = new Notification(
                    sub.getEndpoint(),
                    sub.getP256dh(),
                    sub.getAuth(),
                    payload);

            pushService.send(notification);
            logger.debug("WebPush sent to {}", sub.getEndpoint());
        } catch (Exception e) {
            logger.error("Failed to send WebPush to endpoint {}: {}", sub.getEndpoint(), e.getMessage());
            // Om endpointen är ogiltig/borttagen, ta bort prenumerationen
            if (e.getMessage().contains("404") || e.getMessage().contains("410")) {
                logger.info("Removing expired WebPush subscription: {}", sub.getEndpoint());
                subscriptionRepository.delete(sub);
            }
        }
    }
}
