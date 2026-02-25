package com.eduflex.backend.service;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

@Service
@Slf4j
public class JobTechApiClientService {

    private final RestTemplate restTemplate;
    private static final String SEARCH_URL = "https://jobsearch.api.jobtechdev.se/search";
    private static final String TAXONOMY_URL = "https://taxonomy.api.jobtechdev.se/v1/taxonomy/main";

    public JobTechApiClientService() {
        this.restTemplate = new RestTemplate();
    }

    public Map<String, Object> searchJobs(String query, String city, int limit) {
        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(SEARCH_URL)
                    .queryParam("q", query)
                    .queryParam("limit", limit);

            if (city != null && !city.isEmpty()) {
                builder.queryParam("location", city);
            }

            // Standard filter for LIA/Praktik if query is empty
            if (query == null || query.isEmpty()) {
                builder.queryParam("q", "LIA APL praktik");
            }

            String url = builder.encode().toUriString();
            log.info("🔍 Anropar JobTech Search: {}", url);

            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("❌ JobTech search failed: {}", e.getMessage());
            return Map.of("hits", Collections.emptyList(), "total", 0);
        }
    }

    public List<Map<String, Object>> getSkillsFromTaxonomy(String label) {
        // Simple search in taxonomy for related skills
        String url = TAXONOMY_URL + "/concepts?type=skill&label=" + label;
        try {
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            return (List<Map<String, Object>>) response.getBody();
        } catch (Exception e) {
            log.error("❌ JobTech Taxonomy call failed: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
