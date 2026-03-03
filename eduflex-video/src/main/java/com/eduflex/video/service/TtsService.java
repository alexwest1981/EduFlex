package com.eduflex.video.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.Map;

@Service
@Slf4j
public class TtsService {

    private static final String GOOGLE_TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize?key=%s";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${google.api.key:}")
    private String googleApiKey;

    public TtsService(ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    public byte[] generateSpeech(String text, String voiceName) {
        if (googleApiKey == null || googleApiKey.isEmpty()) {
            log.warn("Google API Key not configured. Skipping TTS generation.");
            return null;
        }

        // Default Swedish voice
        String selectedVoice = "sv-SE-Wavenet-D";
        if (voiceName != null && voiceName.contains("nova")) {
            selectedVoice = "sv-SE-Wavenet-A";
        }

        Map<String, Object> requestBody = Map.of(
                "input", Map.of("text", text),
                "voice", Map.of(
                        "languageCode", "sv-SE",
                        "name", selectedVoice),
                "audioConfig", Map.of(
                        "audioEncoding", "MP3",
                        "pitch", 0.0,
                        "speakingRate", 1.0));

        try {
            String url = String.format(GOOGLE_TTS_URL, googleApiKey);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String audioContent = root.get("audioContent").asText();
                return Base64.getDecoder().decode(audioContent);
            } else {
                log.error("Google TTS failed with status: {}", response.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            log.error("Failed to generate speech with Google TTS", e);
            return null;
        }
    }
}
