package com.eduflex.backend.controller.ai;

import com.eduflex.backend.model.CourseMaterial;
import com.eduflex.backend.service.ai.PowerPointService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai/powerpoint")
public class PowerPointController {

    @Autowired
    private PowerPointService powerPointService;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> generatePPT(@RequestParam Long courseId, @RequestParam Long lessonId) {
        try {
            CourseMaterial result = powerPointService.generateFromLesson(courseId, lessonId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "PowerPoint har genererats framgångsrikt!",
                    "item", result));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Kunde inte generera PowerPoint: " + e.getMessage()));
        }
    }
}
