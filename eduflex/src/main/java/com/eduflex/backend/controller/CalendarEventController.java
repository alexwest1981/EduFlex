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
    private final com.eduflex.backend.service.CalendarService calendarService;

    public CalendarEventController(CalendarEventRepository eventRepository, CourseRepository courseRepository,
            UserRepository userRepository, com.eduflex.backend.service.CalendarService calendarService) {
        this.eventRepository = eventRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.calendarService = calendarService;
    }

    /**
     * Helper to get current user from JWT
     */
    private User getCurrentUser(Jwt jwt) {
        if (jwt == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        String email = jwt.getClaimAsString("email");
        if (email == null) {
            email = jwt.getClaimAsString("preferred_username");
        }
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email not found in token");
        }
        final String finalEmail = email;
        return userRepository.findByEmail(finalEmail)
                .orElseGet(() -> userRepository.findByUsername(finalEmail)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")));
    }

    @GetMapping
    public List<CalendarEvent> getAllEvents(@AuthenticationPrincipal Jwt jwt) {
        List<CalendarEvent> events = eventRepository.findAll();

        // Privacy Filtering
        String currentUserEmail = (jwt != null) ? jwt.getClaimAsString("email") : null;

        return events.stream().map(event -> {
            if (event.getType() == CalendarEvent.EventType.MEETING) {
                boolean isParticipant = false;

                if (currentUserEmail != null && event.getOwner() != null
                        && currentUserEmail.equalsIgnoreCase(event.getOwner().getUsername())) {
                    isParticipant = true;
                }
                if (!isParticipant && currentUserEmail != null && event.getCourse() != null
                        && event.getCourse().getTeacher() != null
                        && currentUserEmail.equalsIgnoreCase(event.getCourse().getTeacher().getUsername())) {
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

    @PostMapping
    public ResponseEntity<Map<String, Object>> createEvent(@RequestBody EventRequest request,
            @AuthenticationPrincipal Jwt jwt) {
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

        if (owner == null && jwt != null) {
            owner = getCurrentUser(jwt);
            System.out.println("   Set owner from JWT: " + (owner != null ? owner.getUsername() : "null"));
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
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
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
    public ResponseEntity<List<User>> getFilterableUsers(@AuthenticationPrincipal Jwt jwt) {
        try {
            User currentUser = getCurrentUser(jwt);
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
            @AuthenticationPrincipal Jwt jwt) {
        try {
            User currentUser = getCurrentUser(jwt);
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
            @AuthenticationPrincipal Jwt jwt) {
        try {
            User currentUser = getCurrentUser(jwt);
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
    public ResponseEntity<List<Long>> getMyCourses(@AuthenticationPrincipal Jwt jwt) {
        try {
            User currentUser = getCurrentUser(jwt);
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
