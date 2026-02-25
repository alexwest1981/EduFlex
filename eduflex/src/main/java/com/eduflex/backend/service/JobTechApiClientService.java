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

    public Map<String, Object> searchJobs(String query, String city, Double lat, Double lon, Integer radius,
            int limit) {
        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(SEARCH_URL)
                    .queryParam("limit", limit);

            if (query != null && !query.isEmpty()) {
                builder.queryParam("q", query);
            } else {
                builder.queryParam("q", "LIA APL praktik");
            }

            if (city != null && !city.isEmpty()) {
                builder.queryParam("municipality", city);
            }

            if (lat != null && lon != null) {
                builder.queryParam("position.latitude", lat);
                builder.queryParam("position.longitude", lon);
                if (radius != null) {
                    builder.queryParam("position.radius", radius);
                }
            }

            String url = builder.encode().toUriString();
            log.info("🔍 Anropar JobTech Search: {}", url);

            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("total")) {
                log.info("✅ JobTech svar: {} träffar hittades.", body.get("total"));
            }
            return body;
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
