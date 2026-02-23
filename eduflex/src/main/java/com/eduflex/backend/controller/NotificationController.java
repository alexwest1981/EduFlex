package com.eduflex.backend.controller;

import com.eduflex.backend.model.Notification;
import com.eduflex.backend.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final com.eduflex.backend.service.WebPushService webPushService;

    public NotificationController(NotificationService notificationService,
            com.eduflex.backend.service.WebPushService webPushService) {
        this.notificationService = notificationService;
        this.webPushService = webPushService;
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getUserNotifications(@PathVariable Long userId) {
        return notificationService.getUserNotifications(userId);
    }

    @GetMapping("/user/{userId}/unread-count")
    public Map<String, Long> getUnreadCount(@PathVariable Long userId) {
        Map<String, Long> response = new HashMap<>();
        response.put("count", notificationService.getUnreadCount(userId));
        return response;
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    @PutMapping("/user/{userId}/mark-all-read")
    public void markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
    }

    // --- WEB PUSH / PWA ---

    @GetMapping("/vapid-public-key")
    public Map<String, String> getVapidPublicKey() {
        return Map.of("publicKey", webPushService.getPublicKey());
    }

    @PostMapping("/subscribe/{userId}")
    public void subscribe(@PathVariable Long userId, @RequestBody Map<String, String> subscription) {
        webPushService.subscribe(
                userId,
                subscription.get("endpoint"),
                subscription.get("p256dh"),
                subscription.get("auth"));
    }

    @PostMapping("/unsubscribe")
    public void unsubscribe(@RequestBody Map<String, String> body) {
        webPushService.unsubscribe(body.get("endpoint"));
    }
}