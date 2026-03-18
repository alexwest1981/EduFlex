package com.eduflex.backend.controller;

import com.eduflex.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * TestController för att trigga push-notiser manuellt under
 * utveckling/verifiering.
 */
@RestController
@RequestMapping("/api/admin/test-notifications")
@RequiredArgsConstructor
public class NotificationTestController {

    private final NotificationService notificationService;

    /**
     * POST /api/admin/test-notifications/trigger
     * Skickar en test-notis till en specifik användare.
     */
    @PostMapping("/trigger")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<String> triggerTestNotification(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        String message = (String) payload.getOrDefault("message", "Detta är en test-notis från EduFlex!");
        String type = (String) payload.getOrDefault("type", "SYSTEM_TEST");

        notificationService.createNotification(
                userId,
                message,
                type,
                null,
                null,
                "/dashboard",
                false,
                false,
                true // Trigger push!
        );

        return ResponseEntity.ok("Test-notis triggad för användare " + userId);
    }
}
