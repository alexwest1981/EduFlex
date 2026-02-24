package com.eduflex.backend.controller;

import com.eduflex.backend.model.ExamIntegrityEvent;
import com.eduflex.backend.service.ExamIntegrityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/integrity")
public class ExamIntegrityController {

    private final ExamIntegrityService integrityService;
    private final com.eduflex.backend.service.LiveKitService liveKitService;
    private final com.eduflex.backend.repository.UserRepository userRepository;

    public ExamIntegrityController(ExamIntegrityService integrityService,
            com.eduflex.backend.service.LiveKitService liveKitService,
            com.eduflex.backend.repository.UserRepository userRepository) {
        this.integrityService = integrityService;
        this.liveKitService = liveKitService;
        this.userRepository = userRepository;
    }

    @GetMapping("/token/{quizId}")
    public ResponseEntity<String> getToken(@PathVariable Long quizId, @RequestParam Long userId) {
        com.eduflex.backend.model.User user = userRepository.findById(userId).orElse(null);
        String name = user != null ? user.getFullName() : "User " + userId;
        String roomName = "exam-" + quizId;

        // Host if the user is a TEACHER or ADMIN
        boolean isHost = false;
        if (user != null && user.getRole() != null) {
            String roleName = user.getRole().getName();
            String dashboard = user.getRole().getDefaultDashboard();
            isHost = "ROLE_ADMIN".equals(roleName) || "ROLE_TEACHER".equals(roleName) ||
                    "ADMIN".equals(dashboard) || "TEACHER".equals(dashboard);
        }

        String token = liveKitService.createJoinToken(roomName, userId.toString(), name, isHost);
        return ResponseEntity.ok(token);
    }

    @GetMapping("/server-url")
    public ResponseEntity<String> getServerUrl() {
        return ResponseEntity.ok(System.getProperty("livekit.url", "ws://localhost:7880"));
    }

    @PostMapping("/log")
    public ResponseEntity<ExamIntegrityEvent> logEvent(@RequestBody ExamIntegrityEvent event) {
        return ResponseEntity.ok(integrityService.logEvent(event));
    }

    @GetMapping("/quiz/{quizId}")
    public List<ExamIntegrityEvent> getEventsForQuiz(@PathVariable Long quizId) {
        return integrityService.getEventsForQuiz(quizId);
    }

    @GetMapping("/quiz/{quizId}/student/{studentId}")
    public List<ExamIntegrityEvent> getStudentEventsInQuiz(@PathVariable Long quizId, @PathVariable Long studentId) {
        return integrityService.getEventsForStudentInQuiz(quizId, studentId);
    }

    @PostMapping("/recent")
    public List<ExamIntegrityEvent> getRecentEvents(@RequestBody List<Long> quizIds) {
        return integrityService.getMostRecentEventsForQuizzes(quizIds);
    }
}
