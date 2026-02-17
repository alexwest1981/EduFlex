package com.eduflex.backend.controller;

import com.eduflex.backend.dto.SkillsGapDTO;
import com.eduflex.backend.service.SkillsGapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillsGapController {

    private final SkillsGapService skillsGapService;

    @GetMapping("/gap")
    public ResponseEntity<SkillsGapDTO> getMySkillsGap(@RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(skillsGapService.getStudentGaps(userId));
    }

    @GetMapping("/class/{courseId}")
    public ResponseEntity<?> getCourseHeatmap(@PathVariable Long courseId) {
        return ResponseEntity.ok(skillsGapService.getCourseHeatmap(courseId));
    }
}
