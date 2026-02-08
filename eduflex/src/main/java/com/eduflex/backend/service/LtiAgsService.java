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
    private final com.eduflex.backend.repository.LtiLaunchRepository ltiLaunchRepository;

    @org.springframework.beans.factory.annotation.Autowired
    public LtiAgsService(LtiAdvantageService advantageService,
            com.eduflex.backend.repository.LtiLaunchRepository ltiLaunchRepository) {
        this(advantageService, ltiLaunchRepository, new RestTemplate());
    }

    public LtiAgsService(LtiAdvantageService advantageService,
            com.eduflex.backend.repository.LtiLaunchRepository ltiLaunchRepository,
            RestTemplate restTemplate) {
        this.advantageService = advantageService;
        this.ltiLaunchRepository = ltiLaunchRepository;
        this.restTemplate = restTemplate;
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

    /**
     * Sync a grade for a user and course to the LTI platform.
     */
    public void syncGrade(com.eduflex.backend.model.User user, com.eduflex.backend.model.Course course, Double score) {
        // 1. Find the LTI Launch context for this user and course
        // We need to find a launch that has agsLineItemUrl

        // This is a simplification. A user might have launches from different
        // platforms/resources for the same course?
        // Ideally we link the Course enrollment to a specific LTI Launch or Deployment.
        // For now, we look for *any* launch for this user where targetLinkUri matches
        // the course.
        // Or better: We find the latest launch for this user that has AGS endpoints.

        java.util.List<com.eduflex.backend.model.LtiLaunch> launches = ltiLaunchRepository.findByUser(user);

        com.eduflex.backend.model.LtiLaunch validLaunch = launches.stream()
                .filter(l -> l.getAgsLineItemUrl() != null && !l.getAgsLineItemUrl().isEmpty())
                // check if launch is relevant to this course?
                // If targetLinkUri contains courseId, we can match.
                .filter(l -> l.getTargetLinkUri() != null
                        && l.getTargetLinkUri().contains("/courses/" + course.getId()))
                .findFirst()
                .orElse(null);

        if (validLaunch == null) {
            logger.warn("⚠️ No valid LTI AGS launch found for user {} in course {}. Cannot sync grade.", user.getId(),
                    course.getId());
            return;
        }

        LtiScoreDTO scoreDto = new LtiScoreDTO();
        scoreDto.setUserId(validLaunch.getUserSub()); // Use the LMS User ID (sub)
        scoreDto.setScoreGiven(score);
        scoreDto.setScoreMaximum(1.0); // Assuming normalized 0-1 or 1.0 logic? Or 100?
        // LTI 1.3 usually expects normalized 0.0-1.0 if not specified otherwise, but
        // ActivityProgress/GradingProgress matter.
        scoreDto.setActivityProgress("Completed");
        scoreDto.setGradingProgress("FullyGraded");
        scoreDto.setTimestamp(Instant.now().toString());

        logger.info("🚀 Syncing grade for user {} to {}", user.getId(), validLaunch.getPlatformIssuer());
        postScore(validLaunch.getPlatformIssuer(), validLaunch.getAgsLineItemUrl(), scoreDto);
    }
}
