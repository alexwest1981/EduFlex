package com.eduflex.backend.controller;

import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.ai.AIPersonalizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/personalization")
public class PersonalizationController {

    private final AIPersonalizationService personalizationService;
    private final UserRepository userRepository;

    public PersonalizationController(AIPersonalizationService personalizationService, UserRepository userRepository) {
        this.personalizationService = personalizationService;
        this.userRepository = userRepository;
    }

    @GetMapping("/analyze")
    public ResponseEntity<Map<String, Object>> getMyAnalysis() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username).orElse(null));

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(personalizationService.analyzeStudentPerformance(user.getId()));
    }

    @GetMapping("/analyze/{userId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ADMIN', 'TEACHER', 'ROLE_ADMIN', 'ROLE_TEACHER')")
    public ResponseEntity<Map<String, Object>> getUserAnalysis(@PathVariable Long userId) {
        return ResponseEntity.ok(personalizationService.analyzeStudentPerformance(userId));
    }
}
