package com.eduflex.accessibility;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AccessibilityScanner {

    private final RequirementFetcher fetcher;
    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
    
    private static final String AI_SERVICE_URL = "http://eduflex-ai:8000/api/ai/chat";

    public Map<String, Object> scanContent(String content, String type) {
        log.info("Starting AI-driven accessibility scan for {} content...", type);
        
        List<AccessibilityRequirement> relevantReqs = fetcher.getRequirements().stream()
                .filter(req -> req.getObjectType() != null && (req.getObjectType().contains(type) || req.getObjectType().isEmpty()))
                .limit(20) // Limit to top 20 most critical for prompt size
                .collect(Collectors.toList());

        StringBuilder reqString = new StringBuilder();
        relevantReqs.forEach(r -> reqString.append(r.getId()).append(": ").append(r.getName()).append("\n"));

        Map<String, Object> aiRequest = new HashMap<>();
        aiRequest.put("prompt", "GRANSKA FÖLJANDE INNEHÅLL:\n---\n" + content + "\n---\nMOT DESSA KRAV:\n" + reqString);
        aiRequest.put("system_prompt", "ACCESSIBILITY_SYSTEM_PROMPT"); // Handled in eduflex-ai if we add logic there, or we pass string
        
        // Let's pass the string directly for now to ensure it works
        String systemPrompt = "Du är en expert på digital tillgänglighet (DOS-lagen). Granska innehåll och returnera JSON enligt: {score, compliant, issues: [{requirementId, severity, description, suggestion, context}], summary}";
        aiRequest.put("system_prompt", systemPrompt);

        try {
            log.info("Calling AI service at {}", AI_SERVICE_URL);
            Map<String, String> response = restTemplate.postForObject(AI_SERVICE_URL, aiRequest, Map.class);
            
            if (response != null && response.containsKey("text")) {
                String aiJson = cleanJson(response.get("text"));
                // The eduflex-ai service returns raw JSON inside "text" field
                Map<String, Object> result = new com.fasterxml.jackson.databind.ObjectMapper().readValue(aiJson, Map.class);
                result.put("requirements_count", relevantReqs.size());
                return result;
            }
        } catch (Exception e) {
            log.error("AI Scan failed: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "AI service unreachable or failed to parse");
            error.put("details", e.getMessage());
            return error;
        }

        return Map.of("status", "failed", "message", "No response from AI engine");
    }

    private String cleanJson(String text) {
        if (text == null) return "{}";
        text = text.trim();
        if (text.startsWith("```json")) {
            text = text.substring(7);
        } else if (text.startsWith("```")) {
            text = text.substring(3);
        }
        if (text.endsWith("```")) {
            text = text.substring(0, text.length() - 3);
        }
        return text.trim();
    }
}
