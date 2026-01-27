package com.eduflex.backend.service;

import com.eduflex.backend.model.LtiPlatform;
import com.eduflex.backend.repository.LtiPlatformRepository;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AgsService {

    private static final Logger logger = LoggerFactory.getLogger(AgsService.class);
    private final LtiPlatformRepository platformRepository;
    private final RestTemplate restTemplate;
    private final LtiService ltiService;

    public AgsService(LtiPlatformRepository platformRepository, LtiService ltiService) {
        this.platformRepository = platformRepository;
        this.ltiService = ltiService;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Post a grade to the LMS via LTI AGS.
     * 
     * @param platformIssuer The issuer of the platform (to get tokenUrl and
     *                       clientId)
     * @param lineItemUrl    The specific AGS lineitem URL (received in launch)
     * @param studentId      The external (LMS) student ID (the 'sub' claim)
     * @param score          The achieved score
     * @param maxScore       The maximum possible score
     */
    public void postScore(String platformIssuer, String lineItemUrl, String studentId, double score, double maxScore) {
        try {
            LtiPlatform platform = platformRepository.findByIssuer(platformIssuer)
                    .orElseThrow(() -> new IllegalArgumentException("Unknown platform: " + platformIssuer));

            // 1. Get Access Token from LMS
            String accessToken = getAccessToken(platform);

            // 2. Prepare Score Payload
            Map<String, Object> scorePayload = new HashMap<>();
            scorePayload.put("userId", studentId);
            scorePayload.put("activityProgress", "Completed");
            scorePayload.put("gradingProgress", "FullyGraded");
            scorePayload.put("scoreGiven", score);
            scorePayload.put("scoreMaximum", maxScore);
            scorePayload.put("timestamp",
                    new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").format(new Date()));

            // 3. Post to AGS
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.valueOf("application/vnd.ims.lis.v1.score+json"));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(scorePayload, headers);

            String scoresUrl = lineItemUrl + "/scores";
            ResponseEntity<String> response = restTemplate.postForEntity(scoresUrl, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Successfully posted score to LMS: {} for student {}", score, studentId);
            } else {
                logger.error("Failed to post score to LMS. Status: {}, Body: {}", response.getStatusCode(),
                        response.getBody());
            }

        } catch (Exception e) {
            logger.error("Error during AGS score post", e);
        }
    }

    private String getAccessToken(LtiPlatform platform) throws Exception {
        // Create Client Credentials JWT (Grant Type: client_credentials)
        RSAKey clientKey = ltiService.getRsaKey();

        JWSSigner signer = new RSASSASigner(clientKey);
        JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.RS256)
                .keyID(clientKey.getKeyID())
                .build();

        Date now = new Date();
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(platform.getClientId())
                .subject(platform.getClientId())
                .audience(platform.getTokenUrl())
                .expirationTime(new Date(now.getTime() + 60 * 1000))
                .issueTime(now)
                .jwtID(UUID.randomUUID().toString())
                .build();

        SignedJWT signedJWT = new SignedJWT(header, claims);
        signedJWT.sign(signer);
        String assertion = signedJWT.serialize();

        // Request Token
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "client_credentials");
        params.add("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
        params.add("client_assertion", assertion);
        params.add("scope", "https://purl.imsglobal.org/spec/lti-ags/scope/score");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(platform.getTokenUrl(), request, Map.class);

        if (response.getBody() != null && response.getBody().containsKey("access_token")) {
            return (String) response.getBody().get("access_token");
        } else {
            throw new RuntimeException("Failed to obtain LMS access token");
        }
    }
}
