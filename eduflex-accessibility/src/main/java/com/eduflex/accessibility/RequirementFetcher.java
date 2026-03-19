package com.eduflex.accessibility;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.annotation.EnableScheduling;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.Arrays;
import java.util.ArrayList;

@Service
@Slf4j
@EnableScheduling
public class RequirementFetcher {

    private static final String DATASET_URL = "https://data.arbetsformedlingen.se/accessibility/latest/accessibility-requirements.json";
    private List<AccessibilityRequirement> requirements = new ArrayList<>();
    private final RestTemplate restTemplate = new RestTemplate();

    @PostConstruct
    public void init() {
        refreshRequirements();
    }

    @Scheduled(fixedRate = 86400000) // Refresh every 24 hours
    public void refreshRequirements() {
        log.info("Fetching latest accessibility requirements from Arbetsförmedlingen...");
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("User-Agent", "EduFlex-Accessibility-Engine/1.0 (+http://eduflex.se)");
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            
            org.springframework.http.ResponseEntity<RequirementResponse> response = 
                restTemplate.exchange(DATASET_URL, org.springframework.http.HttpMethod.GET, entity, RequirementResponse.class);
            
            if (response.getBody() != null && response.getBody().getData() != null) {
                this.requirements = response.getBody().getData();
                log.info("Successfully ingested {} accessibility requirements.", requirements.size());
            }
        } catch (Exception e) {
            log.error("Failed to fetch accessibility requirements from {}: {}", DATASET_URL, e.getMessage());
        }
    }

    public List<AccessibilityRequirement> getRequirements() {
        return requirements;
    }
}
