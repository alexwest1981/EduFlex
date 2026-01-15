package com.eduflex.backend.controller;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CalendarEvent;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CalendarEventRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class CalendarEventController {

    private final CalendarEventRepository eventRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CalendarEventController(CalendarEventRepository eventRepository, CourseRepository courseRepository,
            UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<CalendarEvent> getAllEvents(@AuthenticationPrincipal Jwt jwt) {
        List<CalendarEvent> events = eventRepository.findAll();

        // Privacy Filtering
        String currentUserEmail = (jwt != null) ? jwt.getClaimAsString("email") : null;

        return events.stream().map(event -> {
            // Check if privacy filter applies (e.g., specific types like
            // MEETING/ONE-ON-ONE)
            // For now, assuming MEETING is the private type
            if (event.getType() == CalendarEvent.EventType.MEETING) {
                boolean isParticipant = false;

                // Check if current user is owner
                if (currentUserEmail != null && event.getOwner() != null
                        && currentUserEmail.equalsIgnoreCase(event.getOwner().getUsername())) {
                    isParticipant = true;
                }
                // Check if current user is teacher of the course
                if (!isParticipant && currentUserEmail != null && event.getCourse() != null
                        && event.getCourse().getTeacher() != null
                        && currentUserEmail.equalsIgnoreCase(event.getCourse().getTeacher().getUsername())) {
                    isParticipant = true;
                }
                // Check attendees (future)

                if (!isParticipant) {
                    // Create a safe copy/anonymized version (or modify transiently if scope allows,
                    // but safer to return sanitized object)
                    // HACK: Modifying the object here might be risky if it's managed, but for a GET
                    // it's usually fine before JSON serialization
                    // Better to clone or mask.
                    event.setTitle("Upptagen");
                    event.setDescription(null);
                    event.setMeetingLink(null);
                    // Hide other sensitive info
                }
            }
            return event;
        }).toList();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createEvent(@RequestBody EventRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        CalendarEvent event = new CalendarEvent();
        event.setTitle(request.title);
        event.setDescription(request.description);
        event.setStartTime(request.startTime);
        event.setEndTime(request.endTime);
        event.setType(request.type);
        event.setStatus(request.status != null ? request.status : CalendarEvent.EventStatus.CONFIRMED);
        event.setPlatform(request.platform != null ? request.platform : CalendarEvent.EventPlatform.NONE);
        event.setMeetingLink(request.meetingLink);
        event.setIsMandatory(request.isMandatory != null ? request.isMandatory : false);
        event.setTopic(request.topic);

        // Optional Course Association
        if (request.courseId != null) {
            Course course = courseRepository.findById(request.courseId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
            event.setCourse(course);

            // Auto-assign Teacher from Course if not specified (?)
            // Logic: If Student books, status is PENDING for Course Events?
            // User current = ...
        }

        if (request.ownerId != null) {
            User owner = userRepository.findById(request.ownerId).orElse(null);
            event.setOwner(owner);
        } else if (jwt != null) {
            String email = jwt.getClaimAsString("email");
            User owner = userRepository.findByUsername(email).orElse(null); // Assuming username=email
            event.setOwner(owner);
        }

        CalendarEvent saved = eventRepository.save(event);

        // Return simple response to avoid Hibernate proxy serialization issues
        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("message", "Event created successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        // TODO: Add permission check (only owner or teacher can delete)
        eventRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateEventStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        CalendarEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        String statusStr = request.get("status");
        if (statusStr != null) {
            try {
                CalendarEvent.EventStatus newStatus = CalendarEvent.EventStatus.valueOf(statusStr.toUpperCase());
                event.setStatus(newStatus);
                eventRepository.save(event);
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + statusStr);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", event.getId());
        response.put("status", event.getStatus().toString());
        response.put("message", "Event status updated successfully");
        return ResponseEntity.ok(response);
    }

    // DTO för inkommande data
    static class EventRequest {
        public String title;
        public String description;
        public java.time.LocalDateTime startTime;
        public java.time.LocalDateTime endTime;
        public CalendarEvent.EventType type;
        public CalendarEvent.EventStatus status;
        public CalendarEvent.EventPlatform platform;
        public String meetingLink;
        public Boolean isMandatory; // Changed from boolean to Boolean
        public String topic;
        public Long courseId; // Nullable
        public Long ownerId; // Nullable
    }
}
