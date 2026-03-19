package com.eduflex.accessibility;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/v1/accessibility")
@RequiredArgsConstructor
public class AccessibilityController {

    private final RequirementFetcher fetcher;
    private final AccessibilityScanner scanner;

    @GetMapping("/status")
    public Map<String, String> getStatus() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "operational");
        status.put("version", "0.0.1-SNAPSHOT");
        status.put("engine", "EN 301 549 V3.2.1");
        status.put("requirements_count", String.valueOf(fetcher.getRequirements().size()));
        return status;
    }

    @GetMapping("/requirements")
    public List<AccessibilityRequirement> getAllRequirements() {
        return fetcher.getRequirements();
    }

    @PostMapping("/scan")
    public Map<String, Object> scanContent(@RequestBody Map<String, String> request) {
        String content = request.getOrDefault("content", "");
        String type = request.getOrDefault("type", "web");
        return scanner.scanContent(content, type);
    }
}
