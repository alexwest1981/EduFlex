package com.eduflex.backend.controller;

import com.eduflex.backend.model.LtiPlatform;
import com.eduflex.backend.repository.LtiPlatformRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.ui.Model;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Controller // Using @Controller because we might redirect or render basic views/debug info
@RequestMapping("/lti")
public class LtiController {

    private final LtiPlatformRepository ltiPlatformRepository;

    public LtiController(LtiPlatformRepository ltiPlatformRepository) {
        this.ltiPlatformRepository = ltiPlatformRepository;
    }

    /**
     * OIDC Login Initiation Endpoint
     * The LMS calls this to start the launch process.
     * We need to validate the issuer and return a redirect to the LMS's
     * Authorization URL.
     */
    @GetMapping("/login_init")
    public void loginInit(
            @RequestParam("iss") String issuer,
            @RequestParam("login_hint") String loginHint,
            @RequestParam("target_link_uri") String targetLinkUri,
            @RequestParam(value = "client_id", required = false) String clientId,
            HttpServletResponse response) throws IOException {

        System.out.println("LTI Login Init: iss=" + issuer + ", login_hint=" + loginHint);

        // 1. Find the platform
        Optional<LtiPlatform> platformOpt = (clientId != null)
                ? ltiPlatformRepository.findByIssuerAndClientId(issuer, clientId)
                : ltiPlatformRepository.findByIssuer(issuer);

        if (platformOpt.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Unknown LTI Issuer: " + issuer);
            return;
        }

        LtiPlatform platform = platformOpt.get();

        // 2. Construct the OIDC Authorization Redirect
        String nonce = UUID.randomUUID().toString();
        String state = UUID.randomUUID().toString();

        // In a real impl, we should store nonce/state in a cookie/session to verify
        // later.

        String redirectUrl = platform.getAuthUrl() +
                "?scope=openid" +
                "&response_type=id_token" +
                "&client_id=" + platform.getClientId() +
                "&redirect_uri=" + targetLinkUri +
                "&login_hint=" + loginHint +
                "&state=" + state +
                "&response_mode=form_post" +
                "&nonce=" + nonce +
                "&prompt=none";

        response.sendRedirect(redirectUrl);
    }

    /**
     * LTI Launch Endpoint (Resource Link Launch)
     * The LMS POSTs the id_token here.
     */
    @PostMapping("/launch")
    @ResponseBody
    public String handleLaunch(@RequestParam("id_token") String idToken, @RequestParam("state") String state) {
        // In a real implementation:
        // 1. Validate JWT signature using Platform's JWKS
        // 2. Validate nonce/state
        // 3. Extract user info (sub, email, roles)
        // 4. Create session/JWT for EduFlex
        // 5. Redirect user to the frontend Dashboard

        System.out.println("LTI Launch received. Token length: " + idToken.length());

        // For Phase 1 Verification: Just print it and acknowledge
        return "LTI Launch Successful! Token received. (Validation pending implementation)";
    }

    // Helper to quick-register a platform for testing (Dev only)
    @PostMapping("/platform/register")
    @ResponseBody
    public LtiPlatform registerPlatform(@RequestBody LtiPlatform platform) {
        return ltiPlatformRepository.save(platform);
    }
}
