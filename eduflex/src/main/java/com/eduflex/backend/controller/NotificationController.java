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

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
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
}