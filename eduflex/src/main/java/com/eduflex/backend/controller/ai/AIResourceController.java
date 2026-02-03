package com.eduflex.backend.controller.ai;

import com.eduflex.backend.model.Resource;
import com.eduflex.backend.service.ai.AIResourceService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/resources")
@CrossOrigin(origins = "*")
public class AIResourceController {

    private final AIResourceService aiResourceService;

    public AIResourceController(AIResourceService aiResourceService) {
        this.aiResourceService = aiResourceService;
    }

    @PostMapping("/generate")
    public Resource generateResource(
            @RequestParam Long userId,
            @RequestParam String type,
            @RequestParam String prompt,
            @RequestParam(required = false) String context) {
        return aiResourceService.generateResource(userId, type, prompt, context);
    }
}
