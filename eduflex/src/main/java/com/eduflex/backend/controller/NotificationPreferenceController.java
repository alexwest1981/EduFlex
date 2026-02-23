package com.eduflex.backend.controller;

import com.eduflex.backend.model.NotificationCategory;
import com.eduflex.backend.model.NotificationChannel;
import com.eduflex.backend.model.NotificationPreference;
import com.eduflex.backend.service.NotificationPreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications/preferences")
@RequiredArgsConstructor
public class NotificationPreferenceController {

    private final NotificationPreferenceService preferenceService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<NotificationPreference>> getPreferences(@PathVariable Long userId) {
        return ResponseEntity.ok(preferenceService.getPreferencesForUser(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Void> updatePreference(
            @PathVariable Long userId,
            @RequestParam NotificationCategory category,
            @RequestParam NotificationChannel channel,
            @RequestParam boolean enabled) {
        preferenceService.updatePreference(userId, category, channel, enabled);
        return ResponseEntity.ok().build();
    }
}
