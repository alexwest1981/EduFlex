package com.eduflex.jobtech;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/jobtech")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class JobTechController {

    private final JobSearchService jobSearchService;

    @GetMapping("/search")
    public Map<String, Object> searchJobs(
            @RequestParam String q,
            @RequestParam(required = false) Integer limit) {
        return jobSearchService.searchJobs(q, limit);
    }

    @GetMapping("/occupations")
    public Map<String, Object> getOccupations(@RequestParam String q) {
        return jobSearchService.getOccupations(q);
    }

    @PostMapping("/match/{jobId}")
    public Map<String, Object> matchJob(
            @PathVariable String jobId,
            @RequestBody Map<String, List<String>> payload) {
        
        List<String> userSkills = payload.getOrDefault("skills", Collections.emptyList());
        log.info("Matching jobId {} against {} user skills", jobId, userSkills.size());
        String warning = null;

        // 1. Get Job Details
        Map<String, Object> jobData = jobSearchService.getJobById(jobId);
        Object descObj = jobData.get("description");
        String description = null;

        if (descObj instanceof String) {
            description = (String) descObj;
        } else if (descObj instanceof Map) {
            description = (String) ((Map) descObj).get("text");
        }

        if (description == null) {
            Object adDescObj = jobData.get("ad_description");
            if (adDescObj instanceof Map) {
                description = (String) ((Map) adDescObj).get("text");
            }
        }

        if (description == null) {
            log.warn("Could not find job description for jobId: {}", jobId);
            return Map.of("error", "Could not find job description", "score", 0);
        }

        // 2. Extract Skills from Job via AI
        Map<String, Object> aiResult = jobSearchService.extractSkills(description);
        List<Map<String, String>> jobSkills = (List<Map<String, String>>) aiResult.getOrDefault("skills", Collections.emptyList());
        
        log.info("Extracted {} skills from job description", jobSkills.size());

        if (jobSkills.isEmpty()) {
            log.warn("AI Skill Extraction returned no skills for jobId: {}", jobId);
            return Map.of(
                "jobId", jobId,
                "score", 0,
                "matchedSkills", Collections.emptyList(),
                "missingRequiredSkills", Collections.emptyList(),
                "totalJobSkills", 0,
                "warning", "Skill extraction pending or failed"
            );
        }

        // 3. Compare
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        
        for (Map<String, String> skill : jobSkills) {
            String name = skill.get("name").toLowerCase();
            boolean isMatched = userSkills.stream()
                    .anyMatch(us -> us.toLowerCase().contains(name) || name.contains(us.toLowerCase()));
            
            if (isMatched) {
                matched.add(skill.get("name"));
            } else if ("REQUIRED".equals(skill.get("importance"))) {
                missing.add(skill.get("name"));
            }
        }

        int score = (int) ((double) matched.size() / jobSkills.size() * 100);

        Map<String, Object> result = new HashMap<>();
        result.put("jobId", jobId);
        result.put("score", score);
        result.put("matchedSkills", matched);
        result.put("missingRequiredSkills", missing);
        result.put("totalJobSkills", jobSkills.size());
        if (warning != null) {
            result.put("warning", warning);
        }
        return result;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "eduflex-jobtech");
    }
}
