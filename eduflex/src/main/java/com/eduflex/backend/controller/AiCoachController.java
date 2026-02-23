package com.eduflex.backend.controller;

import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.ai.PrincipalAiCoachService;
import com.eduflex.backend.service.ai.StudentAiCoachService;
import com.eduflex.backend.service.ai.TeacherAiCoachService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai-coach")
@RequiredArgsConstructor
public class AiCoachController {

    private final StudentAiCoachService studentAiCoachService;
    private final TeacherAiCoachService teacherAiCoachService;
    private final PrincipalAiCoachService principalAiCoachService;
    private final UserRepository userRepository;

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentAiCoachService.StudentAiCoachInsight> getStudentInsight() {
        User user = getCurrentUser();
        return ResponseEntity.ok(studentAiCoachService.getStudentInsight(user.getId()));
    }

    @GetMapping("/teacher/{courseId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<TeacherAiCoachService.TeacherAiCoachInsight> getTeacherInsight(@PathVariable Long courseId) {
        return ResponseEntity.ok(teacherAiCoachService.getTeacherInsight(courseId));
    }

    @GetMapping("/principal")
    @PreAuthorize("hasAnyRole('RECTOR', 'ADMIN')")
    public ResponseEntity<PrincipalAiCoachService.PrincipalAiCoachInsight> getPrincipalInsight() {
        return ResponseEntity.ok(principalAiCoachService.getPrincipalInsight());
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
