package com.eduflex.backend.controller;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.LiveLesson;
import com.eduflex.backend.model.SystemSetting;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.LiveLessonRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.LiveKitService;
import com.eduflex.backend.service.SystemSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/live-lessons")
@CrossOrigin(origins = "*")
public class LiveLessonController {

    private final LiveLessonRepository liveLessonRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final SystemSettingService systemSettingService;
    private final LiveKitService liveKitService;

    public LiveLessonController(LiveLessonRepository liveLessonRepository,
            CourseRepository courseRepository,
            UserRepository userRepository,
            SystemSettingService systemSettingService,
            LiveKitService liveKitService) {
        this.liveLessonRepository = liveLessonRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.systemSettingService = systemSettingService;
        this.liveKitService = liveKitService;
    }

    @PostMapping
    public ResponseEntity<?> createLiveLesson(@RequestBody CreateLiveLessonRequest request) {
        try {
            User host = getCurrentUser();
            if (host == null)
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));

            Course course = courseRepository.findById(request.courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            LiveLesson lesson = new LiveLesson();
            lesson.setTitle(request.title != null ? request.title : course.getName() + " - Live");
            lesson.setDescription(request.description);
            lesson.setRoomName("ef_" + course.getCourseCode().toLowerCase().replaceAll("[^a-z0-9]", "") + "_"
                    + UUID.randomUUID().toString().substring(0, 8));
            lesson.setCourse(course);
            lesson.setHost(host);

            if (request.scheduledStart != null) {
                lesson.setScheduledStart(request.scheduledStart);
                lesson.setScheduledEnd(request.scheduledEnd);
                lesson.setStatus(LiveLesson.Status.SCHEDULED);
            } else {
                lesson.setScheduledStart(LocalDateTime.now());
                lesson.setActualStart(LocalDateTime.now());
                lesson.setStatus(LiveLesson.Status.LIVE);
            }

            return ResponseEntity.ok(liveLessonRepository.save(lesson));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> startLesson(@PathVariable Long id) {
        return liveLessonRepository.findById(id).map(lesson -> {
            lesson.setStatus(LiveLesson.Status.LIVE);
            lesson.setActualStart(LocalDateTime.now());
            liveLessonRepository.save(lesson);
            return ResponseEntity.ok(Map.of("status", "LIVE"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<?> endLesson(@PathVariable Long id) {
        return liveLessonRepository.findById(id).map(lesson -> {
            lesson.setStatus(LiveLesson.Status.ENDED);
            lesson.setActualEnd(LocalDateTime.now());
            liveLessonRepository.save(lesson);
            return ResponseEntity.ok(Map.of("status", "ENDED"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/join")
    public ResponseEntity<?> getJoinInfo(@PathVariable Long id, HttpServletRequest request) {
        try {
            LiveLesson lesson = liveLessonRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Lesson not found"));

            User user = getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            boolean isHost = lesson.getHost().getId().equals(user.getId());

            String token = liveKitService.createJoinToken(
                    lesson.getRoomName(),
                    user.getId().toString(),
                    user.getFullName(),
                    isHost);

            SystemSetting urlSetting = systemSettingService.getSetting("livekit_url");
            String serverUrl = (urlSetting != null && urlSetting.getSettingValue() != null)
                    ? urlSetting.getSettingValue()
                    : System.getenv("LIVEKIT_URL");

            if (serverUrl == null || serverUrl.isEmpty()) {
                String requestHost = request.getServerName();
                if (!requestHost.equals("localhost") && !requestHost.equals("127.0.0.1")) {
                    String protocol = request.isSecure() ? "wss" : "ws";
                    serverUrl = protocol + "://" + requestHost + ":7880";
                } else {
                    serverUrl = "ws://localhost:7880";
                }
            }

            return ResponseEntity.ok(Map.of(
                    "id", lesson.getId(),
                    "roomName", lesson.getRoomName(),
                    "token", token,
                    "serverUrl", serverUrl,
                    "isHost", isHost));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getLessonsForCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(liveLessonRepository.findByCourseIdOrderByScheduledStartDesc(courseId));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingLessons() {
        User user = getCurrentUser();
        if (user == null)
            return ResponseEntity.status(401).build();

        LocalDateTime now = LocalDateTime.now();
        List<LiveLesson.Status> active = List.of(LiveLesson.Status.SCHEDULED, LiveLesson.Status.LIVE);

        List<LiveLesson> lessons = liveLessonRepository.findUpcomingForStudent(user.getId(), now.minusHours(1), active);
        return ResponseEntity.ok(lessons);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username).orElse(null));
    }

    public static class CreateLiveLessonRequest {
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
