package com.eduflex.backend.controller;

import com.eduflex.backend.service.ai.AiStudyPalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/study-pal")
@CrossOrigin(origins = "*")
public class AiStudyPalController {

    private final AiStudyPalService studyPalService;

    public AiStudyPalController(AiStudyPalService studyPalService) {
        this.studyPalService = studyPalService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, Object> request) {
        Long courseId = ((Number) request.get("courseId")).longValue();
        String lessonTitle = (String) request.get("lessonTitle");
        String question = (String) request.get("question");

        String response = studyPalService.chatWithPal(courseId, lessonTitle, question);
        return ResponseEntity.ok(Map.of("response", response));
    }

    @PostMapping("/index-ebook/{id}")
    public ResponseEntity<Void> indexEbook(@PathVariable Long id) {
        studyPalService.indexEbook(id);
        return ResponseEntity.ok().build();
    }
}
