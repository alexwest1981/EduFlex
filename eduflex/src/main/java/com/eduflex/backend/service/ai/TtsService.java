package com.eduflex.backend.service.ai;

import com.eduflex.backend.service.SystemConfigService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.Map;

@Service
public class TtsService {

    private static final Logger logger = LoggerFactory.getLogger(TtsService.class);
    private static final String GOOGLE_TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize?key=%s";

    private final RestTemplate restTemplate;
    private final SystemConfigService systemConfigService;
    private final ObjectMapper objectMapper;

    public TtsService(SystemConfigService systemConfigService, ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.systemConfigService = systemConfigService;
        this.objectMapper = objectMapper;
    }

    public byte[] generateSpeech(String text, String voiceName) {
        // Map common voices or use defaults
        // Common Swedish voices: sv-SE-Wavenet-A, sv-SE-Wavenet-C, sv-SE-Standard-A
        String selectedVoice = "sv-SE-Wavenet-D"; // Premium neural voice
        if (voiceName != null && voiceName.contains("nova")) {
            selectedVoice = "sv-SE-Wavenet-A"; // Fem voice
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
            String url = String.format(GOOGLE_TTS_URL, systemConfigService.getGeminiApiKey());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String audioContent = root.get("audioContent").asText();
                return Base64.getDecoder().decode(audioContent);
            } else {
                throw new RuntimeException("Google TTS failed with status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            logger.error("Failed to generate speech with Google TTS", e);
            throw new RuntimeException("TTS generation failed", e);
        }
    }
}
