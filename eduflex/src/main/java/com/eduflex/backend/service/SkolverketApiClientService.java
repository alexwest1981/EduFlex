package com.eduflex.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@Service
public class SkolverketApiClientService {

    private final RestTemplate restTemplate;
    private static final String API_BASE_URL = "https://api.skolverket.se/syllabus/v1";

    public SkolverketApiClientService() {
        this.restTemplate = new RestTemplate();
    }

    public Object getAllSubjects() {
        String url = API_BASE_URL + "/subjects";
        ResponseEntity<Object> response = restTemplate.getForEntity(url, Object.class);
        return response.getBody();
    }

    public Object getSubject(String code) {
        String url = API_BASE_URL + "/subjects/" + code;
        try {
            ResponseEntity<Object> response = restTemplate.getForEntity(url, Object.class);
            return response.getBody();
        } catch (Exception e) {
            return Map.of("error", "Subject not found or API error: " + e.getMessage());
        }
    }
}
