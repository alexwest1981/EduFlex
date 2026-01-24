package com.eduflex.backend.controller;

import com.eduflex.backend.service.LtiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/lti")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Tag(name = "LTI 1.3 Integration", description = "Endpoints for LTI Connectivity with LMS")
public class LtiController {

    private static final Logger logger = LoggerFactory.getLogger(LtiController.class);
    private final LtiService ltiService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Autowired
    public LtiController(LtiService ltiService) {
        this.ltiService = ltiService;
    }

    @GetMapping("/jwks")
    @Operation(summary = "Get JWK Set", description = "Returns the public keys for signature verification by the LMS.")
    public ResponseEntity<Map<String, Object>> getJwkSet() {
        return ResponseEntity.ok(ltiService.getJwkSet());
    }

    @GetMapping("/login_init")
    @Operation(summary = "OIDC Login Initiation", description = "Step 1: LMS initiates the launch flow.")
    public void loginInit(
            @RequestParam("iss") String iss,
            @RequestParam("login_hint") String loginHint,
            @RequestParam("target_link_uri") String targetLinkUri,
            @RequestParam(value = "lti_message_hint", required = false) String ltiMessageHint,
            HttpServletResponse response) throws IOException {

        logger.info("LTI Login Init from ISS: {}", iss);

        try {
            String redirectUrl = ltiService.getLoginInitRedirectionUrl(iss, loginHint, targetLinkUri, ltiMessageHint);
            response.sendRedirect(redirectUrl);
        } catch (Exception e) {
            logger.error("Login Init Failed", e);
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid LTI Login Init: " + e.getMessage());
        }
    }

    @PostMapping(value = "/launch", consumes = { "application/x-www-form-urlencoded" })
    @Operation(summary = "LTI Resource Link Launch", description = "Step 2: LMS sends the id_token via POST.")
    public void ltiLaunch(
            @RequestParam("id_token") String idToken,
            @RequestParam(value = "state", required = false) String state,
            HttpServletResponse response) throws IOException {

        logger.info("LTI Launch receive. Token length: {}", idToken.length());

        try {
            // Process launch and get internal JWT
            String internalToken = ltiService.processLaunch(idToken);
            String redirectUrl = frontendUrl + "/lti-success?token=" + internalToken;

            logger.info("LTI Launch successful. Redirecting to: {}", redirectUrl);
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            logger.error("LTI Launch Failed", e);
            String errorUrl = frontendUrl + "/login?error=LTI_Launch_Failed&message="
                    + java.net.URLEncoder.encode(e.getMessage(), java.nio.charset.StandardCharsets.UTF_8);
            response.sendRedirect(errorUrl);
        }
    }
}
