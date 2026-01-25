package com.eduflex.backend.controller;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.LiveLesson;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.LiveLessonRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * LiveLessonController - Manages live video classroom sessions.
 * Integrates with Jitsi Meet for real-time video conferencing.
 */
@RestController
@RequestMapping("/api/live-lessons")
@CrossOrigin(origins = "*")
public class LiveLessonController {

    private final LiveLessonRepository liveLessonRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Value("${jitsi.url:http://localhost:8444}")
    private String jitsiBaseUrl;

    public LiveLessonController(LiveLessonRepository liveLessonRepository,
                               CourseRepository courseRepository,
                               UserRepository userRepository) {
        this.liveLessonRepository = liveLessonRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new live lesson (schedule or start immediately)
     */
    @PostMapping
    public ResponseEntity<?> createLiveLesson(@RequestBody CreateLiveLessonRequest request) {
        try {
            User host = getCurrentUser();
            if (host == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
            }

            Course course = courseRepository.findById(request.courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            // Generate unique room name
            String roomName = generateRoomName(course.getCourseCode(), host.getId());

            LiveLesson lesson = new LiveLesson();
            lesson.setTitle(request.title != null ? request.title : course.getName() + " - Live");
            lesson.setDescription(request.description);
            lesson.setRoomName(roomName);
            lesson.setJoinUrl(jitsiBaseUrl + "/" + roomName);
            lesson.setCourse(course);
            lesson.setHost(host);

            // Schedule or start now
            if (request.scheduledStart != null) {
                lesson.setScheduledStart(request.scheduledStart);
                lesson.setScheduledEnd(request.scheduledEnd);
                lesson.setStatus(LiveLesson.Status.SCHEDULED);
            } else {
                // Start immediately
                lesson.setScheduledStart(LocalDateTime.now());
                lesson.setActualStart(LocalDateTime.now());
                lesson.setStatus(LiveLesson.Status.LIVE);
            }

            // Settings
            lesson.setRecordingEnabled(request.recordingEnabled != null ? request.recordingEnabled : false);
            lesson.setChatEnabled(request.chatEnabled != null ? request.chatEnabled : true);
            lesson.setScreenShareEnabled(request.screenShareEnabled != null ? request.screenShareEnabled : true);
            lesson.setMaxParticipants(request.maxParticipants != null ? request.maxParticipants : 50);

            LiveLesson saved = liveLessonRepository.save(lesson);

            return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "roomName", saved.getRoomName(),
                "joinUrl", saved.getJoinUrl(),
                "status", saved.getStatus(),
                "message", saved.getStatus() == LiveLesson.Status.LIVE ? "Lesson started!" : "Lesson scheduled"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Start a scheduled lesson
     */
    @PostMapping("/{id}/start")
    public ResponseEntity<?> startLesson(@PathVariable Long id) {
        try {
            LiveLesson lesson = liveLessonRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Lesson not found"));

            User user = getCurrentUser();
            if (!lesson.getHost().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Only the host can start the lesson"));
            }

            lesson.setStatus(LiveLesson.Status.LIVE);
            lesson.setActualStart(LocalDateTime.now());
            liveLessonRepository.save(lesson);

            return ResponseEntity.ok(Map.of(
                "id", lesson.getId(),
                "joinUrl", lesson.getJoinUrl(),
                "status", "LIVE",
                "message", "Lesson is now live!"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * End a live lesson
     */
    @PostMapping("/{id}/end")
    public ResponseEntity<?> endLesson(@PathVariable Long id) {
        try {
            LiveLesson lesson = liveLessonRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Lesson not found"));

            User user = getCurrentUser();
            if (!lesson.getHost().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Only the host can end the lesson"));
            }

            lesson.setStatus(LiveLesson.Status.ENDED);
            lesson.setActualEnd(LocalDateTime.now());
            liveLessonRepository.save(lesson);

            return ResponseEntity.ok(Map.of(
                "id", lesson.getId(),
                "status", "ENDED",
                "duration", java.time.Duration.between(lesson.getActualStart(), lesson.getActualEnd()).toMinutes(),
                "message", "Lesson ended"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get join info for a lesson
     */
    @GetMapping("/{id}/join")
    public ResponseEntity<?> getJoinInfo(@PathVariable Long id) {
        try {
            LiveLesson lesson = liveLessonRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Lesson not found"));

            User user = getCurrentUser();
            boolean isHost = lesson.getHost().getId().equals(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("id", lesson.getId());
            response.put("title", lesson.getTitle());
            response.put("roomName", lesson.getRoomName());
            response.put("joinUrl", lesson.getJoinUrl());
            response.put("status", lesson.getStatus());
            response.put("isHost", isHost);
            response.put("hostName", lesson.getHost().getFullName());
            response.put("courseName", lesson.getCourse().getName());

            // Jitsi config for iframe
            Map<String, Object> jitsiConfig = new HashMap<>();
            jitsiConfig.put("roomName", lesson.getRoomName());
            jitsiConfig.put("displayName", user.getFullName());
            jitsiConfig.put("email", user.getEmail());
            jitsiConfig.put("startWithAudioMuted", !isHost);
            jitsiConfig.put("startWithVideoMuted", !isHost);
            response.put("jitsiConfig", jitsiConfig);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get upcoming lessons for current user (for dashboard widget)
     */
    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingLessons() {
        try {
            User user = getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
            }

            String role = user.getRole() != null ? user.getRole().getName() : "";
            LocalDateTime now = LocalDateTime.now();
            List<LiveLesson> lessons;

            List<LiveLesson.Status> activeStatuses = List.of(LiveLesson.Status.SCHEDULED, LiveLesson.Status.LIVE);

            if ("TEACHER".equals(role) || "ADMIN".equals(role) || "REKTOR".equals(role)) {
                // Teachers/Admins/Rektors see their hosted lessons
                lessons = liveLessonRepository.findUpcomingForTeacher(user.getId(), now.minusHours(1), activeStatuses);
            } else {
                // Students see lessons from enrolled courses
                lessons = liveLessonRepository.findUpcomingForStudent(user.getId(), now.minusHours(1), activeStatuses);
            }

            // Also include currently live lessons
            List<LiveLesson> live = liveLessonRepository.findAllLive(LiveLesson.Status.LIVE);
            Set<Long> lessonIds = new HashSet<>();
            List<Map<String, Object>> result = new ArrayList<>();

            // Add live lessons first
            for (LiveLesson l : live) {
                if (!lessonIds.contains(l.getId())) {
                    result.add(lessonToMap(l, user));
                    lessonIds.add(l.getId());
                }
            }

            // Add upcoming
            for (LiveLesson l : lessons) {
                if (!lessonIds.contains(l.getId())) {
                    result.add(lessonToMap(l, user));
                    lessonIds.add(l.getId());
                }
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get lessons for a specific course
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getLessonsForCourse(@PathVariable Long courseId) {
        List<LiveLesson> lessons = liveLessonRepository.findByCourseIdOrderByScheduledStartDesc(courseId);
        return ResponseEntity.ok(lessons);
    }

    /**
     * Cancel a scheduled lesson
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelLesson(@PathVariable Long id) {
        try {
            LiveLesson lesson = liveLessonRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Lesson not found"));

            User user = getCurrentUser();
            if (!lesson.getHost().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Only the host can cancel"));
            }

            if (lesson.getStatus() == LiveLesson.Status.LIVE) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot cancel a live lesson. End it first."));
            }

            lesson.setStatus(LiveLesson.Status.CANCELLED);
            liveLessonRepository.save(lesson);

            return ResponseEntity.ok(Map.of("message", "Lesson cancelled"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Helper methods ---

    private String generateRoomName(String courseCode, Long hostId) {
        // Use UUID-based format to avoid meet.jit.si lobby detection
        // Rooms that look more "technical" are less likely to trigger lobby
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        return "ef" + uuid + hostId;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null) return null;
        return userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username).orElse(null));
    }

    private Map<String, Object> lessonToMap(LiveLesson l, User currentUser) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", l.getId());
        map.put("title", l.getTitle());
        map.put("description", l.getDescription());
        map.put("roomName", l.getRoomName());
        map.put("joinUrl", l.getJoinUrl());
        map.put("status", l.getStatus());
        map.put("scheduledStart", l.getScheduledStart());
        map.put("scheduledEnd", l.getScheduledEnd());
        map.put("isHost", l.getHost().getId().equals(currentUser.getId()));
        map.put("hostName", l.getHost().getFullName());
        map.put("courseName", l.getCourse() != null ? l.getCourse().getName() : null);
        map.put("courseId", l.getCourse() != null ? l.getCourse().getId() : null);

        // Calculate time until start
        if (l.getScheduledStart() != null) {
            long minutesUntil = java.time.Duration.between(LocalDateTime.now(), l.getScheduledStart()).toMinutes();
            map.put("minutesUntilStart", minutesUntil);
            map.put("startsIn", formatTimeUntil(minutesUntil));
        }

        return map;
    }

    private String formatTimeUntil(long minutes) {
        if (minutes < 0) return "Pågår nu";
        if (minutes < 1) return "Startar nu";
        if (minutes < 60) return minutes + " min";
        long hours = minutes / 60;
        if (hours < 24) return hours + " tim";
        long days = hours / 24;
        return days + " dag" + (days > 1 ? "ar" : "");
    }

    // --- Request DTOs ---

    static class CreateLiveLessonRequest {
        public Long courseId;
        public String title;
        public String description;
        public LocalDateTime scheduledStart;
        public LocalDateTime scheduledEnd;
        public Boolean recordingEnabled;
        public Boolean chatEnabled;
        public Boolean screenShareEnabled;
        public Integer maxParticipants;
    }
}
