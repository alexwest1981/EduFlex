package com.eduflex.backend.service;

import com.eduflex.backend.dto.LtiMembershipResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class LtiNrpsService {

    private static final Logger logger = LoggerFactory.getLogger(LtiNrpsService.class);
    private final LtiAdvantageService advantageService;
    private final RestTemplate restTemplate;

    public LtiNrpsService(LtiAdvantageService advantageService) {
        this.advantageService = advantageService;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Get memberships for a given context.
     * 
     * @param platformIssuer The issuer of the platform
     * @param membershipsUrl The memberships URL (from LTI launch claims)
     * @return LtiMembershipResponse listing all members
     */
    public LtiMembershipResponse getMemberships(String platformIssuer, String membershipsUrl) {
        try {
            // 1. Get Access Token with NRPS scope
            String scope = "https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly";
            String accessToken = advantageService.getAccessToken(platformIssuer, scope);

            // 2. Prepare Request
            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(java.util.Collections.singletonList(org.springframework.http.MediaType
                    .valueOf("application/vnd.ims.lti-nrps.v2.membershipcontainer+json")));
            headers.setBearerAuth(accessToken);

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            logger.info("📡 Fetching LTI Memberships from: {}", membershipsUrl);

            ResponseEntity<LtiMembershipResponse> response = restTemplate.exchange(
                    membershipsUrl,
                    HttpMethod.GET,
                    entity,
                    LtiMembershipResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                logger.info("✅ Successfully fetched {} members from platform {}",
                        response.getBody().getMembers().size(), platformIssuer);
                return response.getBody();
            } else {
                logger.error("❌ Failed to fetch LTI Memberships. Status: {}", response.getStatusCode());
                return null;
            }

        } catch (Exception e) {
            logger.error("💥 Error fetching LTI Memberships: {}", e.getMessage());
            return null;
        }
    }
}
