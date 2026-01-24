package com.eduflex.backend.controller;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CalendarEvent;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CalendarEventRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

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
     * Helper to get current user from Authentication (supports both JWT and
     * Internal)
     */
    private User getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        Object principal = auth.getPrincipal();
        String username = null;

        if (principal instanceof Jwt) {
            Jwt jwt = (Jwt) principal;
            username = jwt.getClaimAsString("email");
            if (username == null) {
                username = jwt.getClaimAsString("preferred_username");
            }
        } else if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            username = (String) principal;
        }

        if (username == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User identity not found in token");
        }

        final String finalUsername = username;
        return userRepository.findByEmail(finalUsername)
                .orElseGet(() -> userRepository.findByUsername(finalUsername)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")));
    }

    @GetMapping("/dashboard-summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary(Authentication auth) {
        try {
            User currentUser = getCurrentUser(auth);
            Map<String, Object> summary = calendarService.getDashboardSummary(currentUser);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to get dashboard summary: " + e.getMessage());
        }
    }

    @GetMapping
    public List<CalendarEvent> getAllEvents(Authentication auth) {
        List<CalendarEvent> events = eventRepository.findAll();

        // Privacy Filtering
        String currentUserEmail = null;
        if (auth != null && auth.getPrincipal() instanceof Jwt) {
            currentUserEmail = ((Jwt) auth.getPrincipal()).getClaimAsString("email");
        } else if (auth != null && auth.getPrincipal() instanceof UserDetails) {
            currentUserEmail = ((UserDetails) auth.getPrincipal()).getUsername();
        }

        final String finalUserEmail = currentUserEmail;

        return events.stream().map(event -> {
            if (event.getType() == CalendarEvent.EventType.MEETING) {
                boolean isParticipant = false;

                if (finalUserEmail != null && event.getOwner() != null
                        && finalUserEmail.equalsIgnoreCase(event.getOwner().getUsername())) {
                    isParticipant = true;
                }
                if (!isParticipant && finalUserEmail != null && event.getCourse() != null
                        && event.getCourse().getTeacher() != null
                        && finalUserEmail.equalsIgnoreCase(event.getCourse().getTeacher().getUsername())) {
                    isParticipant = true;
                }

                if (!isParticipant) {
                    event.setTitle("Upptagen");
                    event.setDescription(null);
                    event.setMeetingLink(null);
                }
            }
            return event;
        }).toList();
    }

    @GetMapping("/calendar/check-availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @RequestParam Long userId,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) Long excludeEventId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            boolean busy = calendarService.isUserBusy(user, start, end, excludeEventId);
            Map<String, Object> response = new HashMap<>();
            response.put("available", !busy);
            response.put("userId", userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to check availability: " + e.getMessage());
        }
    }

    public static class AvailabilityRequest {
        public Long userId;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        public LocalDateTime start;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        public LocalDateTime end;
        public Long excludeEventId;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createEvent(@RequestBody EventRequest request,
            Authentication auth) {
        System.out.println("📅 Creating event: " + request.title);
        System.out.println("   Start: " + request.startTime + ", End: " + request.endTime);
        System.out.println("   Request ownerId: " + request.ownerId);

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

        if (request.courseId != null) {
            Course course = courseRepository.findById(request.courseId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
            event.setCourse(course);
        }

        // ALWAYS set an owner - prefer explicitly specified, fall back to authenticated
        // user
        User owner = null;
        if (request.ownerId != null) {
            owner = userRepository.findById(request.ownerId).orElse(null);
            System.out.println("   Set owner from ownerId: " + (owner != null ? owner.getUsername() : "null"));
        }

        if (owner == null && auth != null) {
            owner = getCurrentUser(auth);
            System.out.println("   Set owner from Auth: " + (owner != null ? owner.getUsername() : "null"));
        }

        if (owner == null) {
            System.out.println("   ⚠️ ERROR: No owner could be determined!");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event must have an owner");
        }

        event.setOwner(owner);
        System.out.println("   ✅ Owner confirmed: " + owner.getUsername() + " (ID: " + owner.getId() + ")");

        // Add attendees if specified
        if (request.attendeeIds != null && !request.attendeeIds.isEmpty()) {
            System.out.println("   📋 Adding " + request.attendeeIds.size() + " attendees...");
            for (Long attendeeId : request.attendeeIds) {
                userRepository.findById(attendeeId).ifPresent(attendee -> {
                    event.getAttendees().add(attendee);
                    System.out.println("   ✅ Added attendee: " + attendee.getUsername());
                });
            }
        }

        // Final Availability Check
        try {
            calendarService.validateEventAvailability(event);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }

        CalendarEvent saved = eventRepository.save(event);
        System.out.println("✅ Event saved with ID: " + saved.getId() + ", Owner: "
                + (saved.getOwner() != null ? saved.getOwner().getUsername() : "null")
                + ", Attendees: " + saved.getAttendees().size());

        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("message", "Event created successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id, Authentication auth) {
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
    public ResponseEntity<List<User>> getFilterableUsers(Authentication auth) {
        try {
            User currentUser = getCurrentUser(auth);
            List<User> users = calendarService.getUsersFilterableBy(currentUser);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to get filterable users: " + e.getMessage());
        }
    }

    /**
     * Get events for a specific user (for filtering)
     * GET /api/events/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CalendarEvent>> getEventsForUser(
            @PathVariable Long userId,
            @RequestParam(required = false) List<CalendarEvent.EventType> types,
            @RequestParam(required = false) String search,
            Authentication auth) {
        try {
            User currentUser = getCurrentUser(auth);
            List<CalendarEvent> events = calendarService.getEventsForUser(userId, currentUser, types, search);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to get events for user: " + e.getMessage());
        }
    }

    /**
     * Get events for a specific course (for teacher filtering)
     * GET /api/events/course/{courseId}
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CalendarEvent>> getEventsForCourse(
            @PathVariable Long courseId,
            @RequestParam(required = false) List<CalendarEvent.EventType> types,
            @RequestParam(required = false) String search,
            Authentication auth) {
        try {
            User currentUser = getCurrentUser(auth);
            List<CalendarEvent> events = calendarService.getEventsForCourse(courseId, currentUser, types, search);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to get events for course: " + e.getMessage());
        }
    }

    /**
     * Get courses taught by the current user (for teacher course filtering)
     * GET /api/events/my-courses
     */
    @GetMapping("/my-courses")
    public ResponseEntity<List<Long>> getMyCourses(Authentication auth) {
        try {
            User currentUser = getCurrentUser(auth);
            List<Long> courseIds;
            if (currentUser.getRole() != null && "STUDENT".equals(currentUser.getRole().getName())) {
                courseIds = calendarService.getStudentCourseIds(currentUser.getId());
            } else {
                courseIds = calendarService.getTeacherCourseIds(currentUser.getId());
            }
            return ResponseEntity.ok(courseIds);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to get courses: " + e.getMessage());
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
        public Boolean isMandatory;
        public String topic;
        public Long courseId;
        public Long ownerId;
        public List<Long> attendeeIds;
    }
}
