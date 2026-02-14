package com.eduflex.backend.controller;

import com.eduflex.backend.service.ai.AdaptivePathService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/adaptive")
@RequiredArgsConstructor
public class AdaptiveLearningController {

    private final AdaptivePathService adaptivePathService;

    @GetMapping("/recommendation/{courseId}")
    public ResponseEntity<String> getRecommendation(@PathVariable Long courseId, @RequestParam Long studentId) {
        return ResponseEntity.ok(adaptivePathService.getRecommendation(studentId, courseId));
    }
}
