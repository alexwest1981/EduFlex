package com.eduflex.backend.controller;

import com.eduflex.backend.model.CalendarEvent;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CalendarEventRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Provides iCal/ICS calendar feed for external calendar apps.
 * Users can subscribe to their personal feed URL in Google Calendar,
 * Apple Calendar, Outlook, etc.
 *
 * Auth: HMAC-SHA256 token derived from userId + server secret (no DB migration needed).
 * The feed endpoint is public so calendar apps can poll it without a session.
 */
@RestController
@RequestMapping("/api/calendar/ical")
public class ICalController {

    private final UserRepository userRepository;
    private final CalendarEventRepository eventRepository;

    @Value("${eduflex.calendar.secret:eduflex-ical-secret-2024}")
    private String calendarSecret;

    public ICalController(UserRepository userRepository,
                          CalendarEventRepository eventRepository) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
    }

    // ── Authenticated: get the user's personal feed URL ──────────────────────
    @GetMapping("/token")
    public ResponseEntity<?> getICalInfo(Authentication authentication) {
        User user = resolveUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();

        String token = generateToken(user.getId());
        String feedPath = "/api/calendar/ical/feed/" + user.getId() + "/" + token;

        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getId());
        result.put("token", token);
        result.put("feedPath", feedPath);
        return ResponseEntity.ok(result);
    }

    // ── Public: iCal feed (accessed by calendar apps) ─────────────────────────
    @GetMapping(value = "/feed/{userId}/{token}")
    public ResponseEntity<String> getICalFeed(
            @PathVariable Long userId,
            @PathVariable String token) {

        // Validate HMAC token
        if (!generateToken(userId).equals(token)) {
            return ResponseEntity.status(403).build();
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) return ResponseEntity.notFound().build();
        User user = userOpt.get();

        // Collect events: owned + as attendee, from 30 days ago to 1 year ahead
        LocalDateTime from = LocalDateTime.now().minusDays(30);
        LocalDateTime to = LocalDateTime.now().plusYears(1);

        List<CalendarEvent> ownerEvents = eventRepository
                .findByOwnerIdOrderByStartTimeAsc(userId)
                .stream()
                .filter(e -> e.getEndTime() != null && e.getEndTime().isAfter(from))
                .collect(Collectors.toList());

        List<CalendarEvent> attendeeEvents = eventRepository
                .findByAttendeeIdAndStartTimeBetween(userId, from, to);

        // Merge and deduplicate
        Set<Long> seen = new HashSet<>();
        List<CalendarEvent> all = new ArrayList<>();
        for (CalendarEvent e : ownerEvents) { if (seen.add(e.getId())) all.add(e); }
        for (CalendarEvent e : attendeeEvents) { if (seen.add(e.getId())) all.add(e); }
        all.sort(Comparator.comparing(CalendarEvent::getStartTime));

        String ics = buildIcs(user, all);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "text/calendar; charset=UTF-8");
        headers.set("Content-Disposition", "inline; filename=\"eduflex.ics\"");
        // Cache for 15 minutes — enough for calendar apps to not overwhelm the server
        headers.set("Cache-Control", "public, max-age=900");

        return ResponseEntity.ok().headers(headers).body(ics);
    }

    // ── ICS builder ───────────────────────────────────────────────────────────
    private String buildIcs(User user, List<CalendarEvent> events) {
        // iCal requires UTC timestamps in yyyyMMdd'T'HHmmss'Z' format
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");
        String now = LocalDateTime.now(ZoneOffset.UTC).format(fmt);
        String calName = "EduFlex \u2013 " + user.getFirstName() + " " + user.getLastName();

        StringBuilder sb = new StringBuilder(2048);
        sb.append("BEGIN:VCALENDAR\r\n");
        sb.append("VERSION:2.0\r\n");
        sb.append("PRODID:-//EduFlex//EduFlex LMS//SV\r\n");
        sb.append("CALSCALE:GREGORIAN\r\n");
        sb.append("METHOD:PUBLISH\r\n");
        sb.append("X-WR-CALNAME:").append(icsEscape(calName)).append("\r\n");
        sb.append("X-WR-TIMEZONE:Europe/Stockholm\r\n");
        sb.append("REFRESH-INTERVAL;VALUE=DURATION:PT1H\r\n");
        sb.append("X-PUBLISHED-TTL:PT1H\r\n");

        for (CalendarEvent event : events) {
            if (event.getStartTime() == null || event.getEndTime() == null) continue;

            String dtStart = event.getStartTime().atOffset(ZoneOffset.of("+01:00"))
                    .withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime().format(fmt);
            String dtEnd = event.getEndTime().atOffset(ZoneOffset.of("+01:00"))
                    .withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime().format(fmt);

            String typeName = translateType(event.getType());
            String title = event.getTitle();
            String summary = typeName + (title != null && !title.trim().isEmpty()
                    ? " \u2013 " + title : "");

            // Build description
            StringBuilder desc = new StringBuilder();
            String evDesc = event.getDescription();
            if (evDesc != null && !evDesc.trim().isEmpty()) {
                desc.append(evDesc);
            }
            String topic = event.getTopic();
            if (topic != null && !topic.trim().isEmpty()) {
                if (desc.length() > 0) desc.append("\\n");
                desc.append("\u00c4mne: ").append(topic);
            }
            String meetingLink = event.getMeetingLink();
            if (meetingLink != null && !meetingLink.trim().isEmpty()) {
                if (desc.length() > 0) desc.append("\\n");
                desc.append("L\u00e4nk: ").append(meetingLink);
            }

            // Location from platform + meeting link
            String location = "";
            if (event.getPlatform() != null && !"NONE".equals(event.getPlatform().name())) {
                location = event.getPlatform().name();
                if (meetingLink != null && !meetingLink.trim().isEmpty()) {
                    location += " \u2013 " + meetingLink;
                }
            } else if (topic != null && !topic.trim().isEmpty()) {
                location = topic;
            }

            // Map status
            String icsStatus = "CONFIRMED";
            if (event.getStatus() != null) {
                String statusName = event.getStatus().name();
                if ("CANCELLED".equals(statusName)) {
                    icsStatus = "CANCELLED";
                } else if ("PENDING".equals(statusName)) {
                    icsStatus = "TENTATIVE";
                }
            }

            sb.append("BEGIN:VEVENT\r\n");
            sb.append("UID:eduflex-").append(event.getId()).append("@eduflexlms.se\r\n");
            sb.append("DTSTAMP:").append(now).append("\r\n");
            sb.append("DTSTART:").append(dtStart).append("\r\n");
            sb.append("DTEND:").append(dtEnd).append("\r\n");
            sb.append("SUMMARY:").append(icsEscape(summary)).append("\r\n");
            if (desc.length() > 0) {
                sb.append("DESCRIPTION:").append(icsEscape(desc.toString())).append("\r\n");
            }
            if (!location.isEmpty()) {
                sb.append("LOCATION:").append(icsEscape(location)).append("\r\n");
            }
            sb.append("STATUS:").append(icsStatus).append("\r\n");
            if (Boolean.TRUE.equals(event.getIsMandatory())) {
                sb.append("X-EDUFLEX-MANDATORY:TRUE\r\n");
            }
            sb.append("END:VEVENT\r\n");
        }

        sb.append("END:VCALENDAR\r\n");
        return sb.toString();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private String generateToken(Long userId) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(calendarSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(userId.toString().getBytes(StandardCharsets.UTF_8));
            // Convert to hex string
            StringBuilder hex = new StringBuilder(raw.length * 2);
            for (byte b : raw) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Token generation failed", e);
        }
    }

    private User resolveUser(Authentication auth) {
        if (auth == null) return null;
        String id = auth.getName();
        Optional<User> byEmail = userRepository.findByEmail(id);
        if (byEmail.isPresent()) return byEmail.get();
        return userRepository.findByUsername(id).orElse(null);
    }

    private String translateType(Object type) {
        if (type == null) return "H\u00e4ndelse";
        String t = type.toString();
        if ("LESSON".equals(t))     return "Lektion";
        if ("EXAM".equals(t))       return "Tenta";
        if ("WORKSHOP".equals(t))   return "Workshop";
        if ("MEETING".equals(t))    return "M\u00f6te";
        if ("ASSIGNMENT".equals(t)) return "Uppgift";
        return "H\u00e4ndelse";
    }

    /** Escape special characters per RFC 5545 §3.3.11 */
    private String icsEscape(String value) {
        if (value == null) return "";
        return value
                .replace("\\", "\\\\")
                .replace(";", "\\;")
                .replace(",", "\\,")
                .replace("\r\n", "\\n")
                .replace("\n", "\\n")
                .replace("\r", "\\n");
    }
}
