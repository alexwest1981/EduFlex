package com.eduflex.backend.service;

import com.eduflex.backend.dto.LtiScoreDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;

@Service
public class LtiAgsService {

    private static final Logger logger = LoggerFactory.getLogger(LtiAgsService.class);
    private final LtiAdvantageService advantageService;
    private final RestTemplate restTemplate;

    public LtiAgsService(LtiAdvantageService advantageService) {
        this.advantageService = advantageService;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Post a score to the platform.
     * 
     * @param platformIssuer The issuer of the platform
     * @param lineItemUrl    The line item URL (from LTI launch claims)
     * @param score          The score data
     */
    public boolean postScore(String platformIssuer, String lineItemUrl, LtiScoreDTO score) {
        try {
            // 1. Get Access Token with AGS Score scope
            String scope = "https://purl.imsglobal.org/spec/lti-ags/scope/score";
            String accessToken = advantageService.getAccessToken(platformIssuer, scope);

            // 2. Prepare Request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("application/vnd.ims.lis.v1.score+json"));
            headers.setBearerAuth(accessToken);

            // Ensure timestamp is set
            if (score.getTimestamp() == null) {
                score.setTimestamp(Instant.now().toString());
            }

            HttpEntity<LtiScoreDTO> request = new HttpEntity<>(score, headers);

            // Scores endpoint is lineItemUrl + /scores
            String scoresUrl = lineItemUrl;
            if (!scoresUrl.endsWith("/")) {
                scoresUrl += "/";
            }
            scoresUrl += "scores";

            logger.info("📤 Posting LTI Score to: {}", scoresUrl);

            ResponseEntity<String> response = restTemplate.postForEntity(scoresUrl, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("✅ LTI Score posted successfully for user {} to platform {}", score.getUserId(),
                        platformIssuer);
                return true;
            } else {
                logger.error("❌ Failed to post LTI Score. Status: {}, Body: {}", response.getStatusCode(),
                        response.getBody());
                return false;
            }

        } catch (Exception e) {
            logger.error("💥 Error posting LTI Score: {}", e.getMessage());
            return false;
        }
    }
}
