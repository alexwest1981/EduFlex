package com.eduflex.jobtech;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class JobSearchService {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String JOB_SEARCH_API = "https://jobsearch.api.jobtechdev.se/search";
    private static final String TAXONOMY_API = "https://taxonomy.api.jobtechdev.se/v1/taxonomy/concepts";
    private static final String AI_SERVICE_URL = "http://eduflex-ai:8000/api/ai/extract-skills";

    public Map<String, Object> searchJobs(String query, Integer limit) {
        String url = UriComponentsBuilder.fromHttpUrl(JOB_SEARCH_API)
                .queryParam("q", query)
                .queryParam("limit", limit != null ? limit : 10)
                .toUriString();

        try {
            log.info("Searching jobs via JobTech API: {}", url);
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            log.error("Failed to fetch jobs from JobTech API", e);
            throw new RuntimeException("JobTech API Error: " + e.getMessage());
        }
    }

    public Map<String, Object> getOccupations(String query) {
        String url = UriComponentsBuilder.fromHttpUrl(TAXONOMY_API)
                .queryParam("type", "occupation-name")
                .queryParam("q", query)
                .toUriString();

        try {
            log.info("Fetching occupations via Taxonomy API: {}", url);
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            log.error("Failed to fetch taxonomy data", e);
            throw new RuntimeException("Taxonomy API Error: " + e.getMessage());
        }
    }

    public Map<String, Object> getJobById(String id) {
        String url = "https://jobsearch.api.jobtechdev.se/ad/" + id;
        try {
            log.info("Fetching job details via JobTech API: {}", url);
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            log.error("Failed to fetch job details", e);
            return Collections.emptyMap();
        }
    }

    public Map<String, Object> extractSkills(String text) {
        try {
            log.info("Requesting skill extraction from AI service for text length: {}", text.length());
            Map<String, String> request = Map.of("text", text);
            return restTemplate.postForObject(AI_SERVICE_URL, request, Map.class);
        } catch (Exception e) {
            log.error("AI Skill Extraction failed", e);
            return Map.of("skills", Collections.emptyList());
        }
    }
}
