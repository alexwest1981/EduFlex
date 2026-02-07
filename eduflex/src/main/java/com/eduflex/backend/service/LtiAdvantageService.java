package com.eduflex.backend.service;

import com.eduflex.backend.dto.LtiTokenResponse;
import com.eduflex.backend.model.LtiPlatform;
import com.eduflex.backend.repository.LtiPlatformRepository;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.annotation.Lazy;

@Service
public class LtiAdvantageService {

    private static final Logger logger = LoggerFactory.getLogger(LtiAdvantageService.class);
    private final LtiService ltiService;
    private final LtiPlatformRepository platformRepository;
    private final RestTemplate restTemplate;

    // Token Cache: Platform Issuer -> Access Token
    private final Map<String, LtiTokenResponse> tokenCache = new ConcurrentHashMap<>();

    public LtiAdvantageService(@Lazy LtiService ltiService, LtiPlatformRepository platformRepository) {
        this.ltiService = ltiService;
        this.platformRepository = platformRepository;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Get an access token for the given platform and scopes.
     * Uses OAuth2 Client Credentials flow with a signed JWT.
     */
    public String getAccessToken(String platformIssuer, String scope) {
        LtiPlatform platform = platformRepository.findByIssuer(platformIssuer)
                .orElseThrow(() -> new IllegalArgumentException("Unknown Platform Issuer: " + platformIssuer));

        // Check cache
        LtiTokenResponse cached = tokenCache.get(platformIssuer + ":" + scope);
        if (cached != null) {
            // Check if token is expired (giving 10 seconds buffer)
            long now = System.currentTimeMillis();
            long elapsedSeconds = (now - cached.getAcquiredAt()) / 1000;

            if (elapsedSeconds < (cached.getExpiresIn() - 10)) {
                return cached.getAccessToken();
            }
        }

        try {
            // 1. Create the signed JWT (Client Assertion)
            String clientAssertion = createClientAssertion(platform);

            // 2. Request token from platform
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("grant_type", "client_credentials");
            map.add("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
            map.add("client_assertion", clientAssertion);
            map.add("scope", scope);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

            ResponseEntity<LtiTokenResponse> response = restTemplate.postForEntity(platform.getTokenUrl(), request,
                    LtiTokenResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                LtiTokenResponse tokenResponse = response.getBody();
                tokenCache.put(platformIssuer + ":" + scope, tokenResponse);
                return tokenResponse.getAccessToken();
            } else {
                logger.error("Failed to get LTI access token for platform {}. Status: {}", platformIssuer,
                        response.getStatusCode());
                throw new RuntimeException("Failed to obtain LTI access token");
            }

        } catch (Exception e) {
            logger.error("Error during LTI Advantage token request for platform {}: {}", platformIssuer,
                    e.getMessage());
            throw new RuntimeException("LTI Advantage Token Request Failed", e);
        }
    }

    private String createClientAssertion(LtiPlatform platform) throws Exception {
        JWSSigner signer = new RSASSASigner(ltiService.getRsaKey());

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .issuer(platform.getClientId())
                .subject(platform.getClientId())
                .audience(platform.getTokenUrl())
                .issueTime(new Date())
                .expirationTime(new Date(new Date().getTime() + 60 * 1000)) // 1 minute expiration
                .jwtID(UUID.randomUUID().toString())
                .build();

        JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.RS256)
                .keyID(ltiService.getRsaKey().getKeyID())
                .build();

        SignedJWT signedJWT = new SignedJWT(header, claimsSet);
        signedJWT.sign(signer);

        return signedJWT.serialize();
    }
}
