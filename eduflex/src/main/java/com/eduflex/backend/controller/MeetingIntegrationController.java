package com.eduflex.backend.controller;

import com.eduflex.backend.service.MeetingIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller för Zoom/Teams-mötesintegration.
 * Lärare kan skapa möten direkt från kursvyn.
 */
@RestController
@RequestMapping("/api/integrations/meetings")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Tag(name = "Meeting Integration", description = "Zoom/Teams möteshantering")
@RequiredArgsConstructor
public class MeetingIntegrationController {

    private final MeetingIntegrationService meetingService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER', 'PRINCIPAL', 'REKTOR')")
    @Operation(summary = "Skapa ett möte", description = "Skapar Zoom/Teams-möte baserat på aktiv provider")
    public ResponseEntity<Map<String, Object>> createMeeting(@RequestBody Map<String, Object> body) {
        String topic = (String) body.getOrDefault("topic", "EduFlex-möte");
        String startTime = (String) body.getOrDefault("startTime", "");
        int duration = (Integer) body.getOrDefault("duration", 60);

        Map<String, Object> result = meetingService.createMeeting(topic, startTime, duration);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/zoom")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
    @Operation(summary = "Skapa Zoom-möte")
    public ResponseEntity<Map<String, Object>> createZoomMeeting(@RequestBody Map<String, Object> body) {
        String topic = (String) body.getOrDefault("topic", "EduFlex-möte");
        String startTime = (String) body.getOrDefault("startTime", "");
        int duration = (Integer) body.getOrDefault("duration", 60);

        return ResponseEntity.ok(meetingService.createZoomMeeting(topic, startTime, duration));
    }

    @PostMapping("/teams")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'TEACHER', 'ROLE_TEACHER')")
    @Operation(summary = "Skapa Teams-möte")
    public ResponseEntity<Map<String, Object>> createTeamsMeeting(@RequestBody Map<String, Object> body) {
        String topic = (String) body.getOrDefault("subject", "EduFlex-möte");
        String startTime = (String) body.getOrDefault("startTime", "");
        int duration = (Integer) body.getOrDefault("duration", 60);

        return ResponseEntity.ok(meetingService.createTeamsMeeting(topic, startTime, duration));
    }
}
