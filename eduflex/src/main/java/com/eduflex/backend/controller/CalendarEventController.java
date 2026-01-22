package com.eduflex.backend.controller;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CalendarEvent;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CalendarEventRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    private final com.eduflex.backend.service.CalendarService calendarService;

    public CalendarEventController(CalendarEventRepository eventRepository, CourseRepository courseRepository,
            UserRepository userRepository, com.eduflex.backend.service.CalendarService calendarService) {
        this.eventRepository = eventRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.calendarService = calendarService;
    }

    /**
     * Helper to get current user from SecurityContext
     */
    private User getCurrentUser() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()
                || auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "User not found: " + username)));
    }

    @GetMapping
    public List<CalendarEvent> getAllEvents() {
        List<CalendarEvent> events = eventRepository.findAll();

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        String currentUserEmail = (auth != null) ? auth.getName() : null;

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
            @AuthenticationPrincipal Object principal) {
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
        } else {
            User owner = getCurrentUser();
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
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
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

    /**
     * Get users that can be filtered by the current user
     * GET /api/events/filterable-users
     */
    @GetMapping("/filterable-users")
    public ResponseEntity<List<User>> getFilterableUsers() {
        try {
            User currentUser = getCurrentUser();
            List<User> users = calendarService.getUsersFilterableBy(currentUser);
            return ResponseEntity.ok(users);
        } catch (org.springframework.web.server.ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to get filterable users: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CalendarEvent>> getEventsForUser(@PathVariable Long userId) {
        try {
            User currentUser = getCurrentUser();
            List<CalendarEvent> events = calendarService.getEventsForUser(userId, currentUser);
            return ResponseEntity.ok(events);
        } catch (org.springframework.web.server.ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to get events for user: " + e.getMessage());
        }
    }

    /**
     * Get events for a specific course (for teacher filtering)
     * GET /api/events/course/{courseId}
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CalendarEvent>> getEventsForCourse(@PathVariable Long courseId) {
        try {
            User currentUser = getCurrentUser();
            List<CalendarEvent> events = calendarService.getEventsForCourse(courseId, currentUser);
            return ResponseEntity.ok(events);
        } catch (org.springframework.web.server.ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to get events for course: " + e.getMessage());
        }
    }

    @GetMapping("/my-courses")
    public ResponseEntity<List<Long>> getMyCourses() {
        try {
            User currentUser = getCurrentUser();
            List<Long> courseIds = calendarService.getTeacherCourseIds(currentUser.getId());
            return ResponseEntity.ok(courseIds);
        } catch (org.springframework.web.server.ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to get my courses: " + e.getMessage());
        }
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
