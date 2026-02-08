package com.eduflex.backend.service;

import com.eduflex.backend.model.LtiPlatform;
import com.eduflex.backend.model.User;
import com.eduflex.backend.model.Role;
import com.eduflex.backend.repository.LtiKeyRepository;
import com.eduflex.backend.repository.LtiPlatformRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.repository.RoleRepository;
import com.eduflex.backend.repository.LtiLaunchRepository;
import com.eduflex.backend.model.LtiLaunch;
import com.eduflex.backend.security.JwtUtils;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.*;

@Service
public class LtiService {

    private static final Logger logger = LoggerFactory.getLogger(LtiService.class);

    private RSAKey rsaKey;
    private JWKSet jwkSet;

    private final LtiPlatformRepository platformRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final LtiKeyRepository ltiKeyRepository;
    private final LtiLaunchRepository ltiLaunchRepository;
    private final LtiNrpsService ltiNrpsService;
    private final TenantService tenantService;
    private final JwtUtils jwtUtils;
    private final CourseService courseService;

    @Autowired
    public LtiService(LtiPlatformRepository platformRepository, UserRepository userRepository,
            RoleRepository roleRepository, LtiKeyRepository ltiKeyRepository,
            LtiLaunchRepository ltiLaunchRepository,
            @org.springframework.context.annotation.Lazy LtiNrpsService ltiNrpsService,
            TenantService tenantService, JwtUtils jwtUtils,
            CourseService courseService) {
        this.platformRepository = platformRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.ltiKeyRepository = ltiKeyRepository;
        this.ltiLaunchRepository = ltiLaunchRepository;
        this.ltiNrpsService = ltiNrpsService;
        this.tenantService = tenantService;
        this.jwtUtils = jwtUtils;
        this.courseService = courseService;
    }

    @PostConstruct
    public void init() {
        try {
            // Check if we already have a key in the database
            Optional<com.eduflex.backend.model.LtiKey> existingKey = ltiKeyRepository.findFirstByOrderByCreatedAtDesc();

            if (existingKey.isPresent()) {
                logger.info("🔑 Loading existing LTI RSA Key from database (ID: {})", existingKey.get().getKeyId());
                rsaKey = RSAKey.parse(existingKey.get().getPrivateKey());
            } else {
                logger.info("🆕 Generating new LTI RSA Key pair...");
                KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
                gen.initialize(2048);
                KeyPair keyPair = gen.generateKeyPair();

                rsaKey = new RSAKey.Builder((RSAPublicKey) keyPair.getPublic())
                        .privateKey((RSAPrivateKey) keyPair.getPrivate())
                        .keyUse(KeyUse.SIGNATURE)
                        .algorithm(JWSAlgorithm.RS256)
                        .keyID(UUID.randomUUID().toString())
                        .build();

                // Save to database
                com.eduflex.backend.model.LtiKey dbKey = new com.eduflex.backend.model.LtiKey();
                dbKey.setKeyId(rsaKey.getKeyID());
                dbKey.setPrivateKey(rsaKey.toJSONString()); // Store as JWK JSON
                dbKey.setPublicKey(rsaKey.toPublicJWK().toJSONString());
                ltiKeyRepository.save(dbKey);
                logger.info("💾 Saved new LTI RSA Key to database.");
            }

            jwkSet = new JWKSet(rsaKey);

        } catch (Exception e) {
            logger.error("Failed to initialize LTI keys", e);
            // Don't crash the whole app if LTI fails, but it will be broken
        }
    }

    public Map<String, Object> getJwkSet() {
        return jwkSet.toJSONObject();
    }

    public RSAKey getRsaKey() {
        return rsaKey;
    }

    public String getLoginInitRedirectionUrl(String iss, String login_hint, String target_link_uri,
            String lti_message_hint) {

        LtiPlatform platform = platformRepository.findByIssuer(iss)
                .orElseThrow(() -> new IllegalArgumentException("Unknown Platform Issuer: " + iss));

        return platform.getAuthUrl() +
                "?response_type=id_token" +
                "&scope=openid" +
                "&login_hint=" + login_hint +
                "&lti_message_hint=" + lti_message_hint +
                "&client_id=" + platform.getClientId() +
                "&redirect_uri=" + target_link_uri +
                "&state=" + UUID.randomUUID().toString() +
                "&nonce=" + UUID.randomUUID().toString() +
                "&prompt=none";
    }

    public String processLaunch(String idToken) {
        try {
            // 1. Parse without verification first to get Issuer
            SignedJWT signedJWT = SignedJWT.parse(idToken);
            String issuer = signedJWT.getJWTClaimsSet().getIssuer();

            // 2. Find Platform
            LtiPlatform platform = platformRepository.findByIssuer(issuer)
                    .orElseThrow(() -> new IllegalArgumentException("Unknown Platform Issuer: " + issuer));

            // 3. Set Tenant Context if mapped
            if (platform.getTenantId() != null && !platform.getTenantId().isBlank()) {
                com.eduflex.backend.model.Tenant tenant = tenantService.getTenant(platform.getTenantId());
                if (tenant != null && tenant.getDbSchema() != null) {
                    com.eduflex.backend.config.tenant.TenantContext.setCurrentTenant(tenant.getDbSchema());
                    logger.info("🏢 LTI Launch: Switched context to tenant {} (Schema: {})", tenant.getId(),
                            tenant.getDbSchema());
                }
            } else {
                com.eduflex.backend.config.tenant.TenantContext.setCurrentTenant("public");
            }

            // 3.1 Verify Signature using Platform's JWKS
            if (platform.getJwksUrl() != null && !platform.getJwksUrl().isEmpty()) {
                verifySignature(signedJWT, platform.getJwksUrl());
            } else {
                logger.warn("Skipping signature verification: No JWKS URL for platform {}", issuer);
                // In production, this should block. Allowed here only if config is missing but
                // we want to proceed?
                // No, User said "ALL LIVE". We must verify.
                throw new SecurityException("Platform JWKS URL is missing. Cannot verify launch.");
            }

            // 4. Verify Claims
            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
            verifyClaims(claims, platform.getClientId(), platform.getDeploymentId());

            // 5. User Provisioning & Mode Check
            String messageType = (String) claims.getClaim("https://purl.imsglobal.org/spec/lti/claim/message_type");

            if ("LtiDeepLinkingRequest".equals(messageType)) {
                // Deep Linking Launch
                @SuppressWarnings("unchecked")
                Map<String, Object> settings = (Map<String, Object>) claims
                        .getClaim("https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings");
                String deploymentId = (String) claims
                        .getClaim("https://purl.imsglobal.org/spec/lti/claim/deployment_id");

                // Generate a temporary JWT for the frontend to use when submitting selections
                // We reuse existing User provisioning because we need to know WHO is selecting
                String userToken = provisionUserAndGenerateToken(claims);

                // We pack the Deep Linking context into a separate "context token" or just
                // return it structure
                // For simplicity, we return a prefix "DEEP_LINK:" + userToken + "::" +
                // Base64(settings)
                // In a real app, we should store this state in DB or signed JWT.
                // Let's rely on the frontend to pass the simple user token, and we assume we
                // can regenerate the response from the settings.
                // Actually, the frontend needs the 'deep_link_return_url' found in settings.

                String settingsJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(settings);
                String settingsB64 = Base64.getEncoder().encodeToString(settingsJson.getBytes());

                return "DEEP_LINK:" + userToken + ":" + settingsB64 + ":" + deploymentId + ":" + issuer;

            } else {
                // Standard Resource Link Launch
                String token = provisionUserAndGenerateToken(claims);

                // --- LTI ADVANTAGE: AGS & NRPS ---
                try {
                    String sub = claims.getSubject();
                    String targetLinkUri = (String) claims
                            .getClaim("https://purl.imsglobal.org/spec/lti/claim/target_link_uri");

                    // 0. Resolve User FIRST so we can use it for enrollment
                    User user = userRepository
                            .findByEmail(claims.getClaim("email") != null ? (String) claims.getClaim("email")
                                    : claims.getSubject() + "@lti.user")
                            .orElse(null);

                    // 1. Automatic Course Enrollment based on target_link_uri
                    // Expected format: .../courses/{courseId}
                    if (targetLinkUri != null && targetLinkUri.contains("/courses/")) {
                        try {
                            String[] parts = targetLinkUri.split("/courses/");
                            if (parts.length > 1) {
                                String courseIdStr = parts[1].split("/")[0]; // Handle trailing slashes or sub-paths
                                Long courseId = Long.parseLong(courseIdStr);

                                // Enroll Student
                                // Only enroll if it's a student context or we differentiate roles in
                                // addStudentToCourse
                                // For now, we add them as student. Teachers are usually owners.
                                // NOTE: LTI roles are a list, effectively handled by provisionUser, but course
                                // enrollment is specific.
                                if (user != null) {
                                    courseService.addStudentToCourse(courseId, user.getId());
                                    logger.info("🎓 Auto-enrolled user {} (ID: {}) into Course {}", sub, user.getId(),
                                            courseId);
                                } else {
                                    logger.warn("⚠️ Cannot auto-enroll user {} because User entity was not found.",
                                            sub);
                                }
                            }
                        } catch (Exception e) {
                            logger.warn("⚠️ Failed to auto-enroll user in course from URI: {}. Error: {}",
                                    targetLinkUri, e.getMessage());
                        }
                    }

                    @SuppressWarnings("unchecked")
                    Map<String, Object> resourceLink = (Map<String, Object>) claims
                            .getClaim("https://purl.imsglobal.org/spec/lti/claim/resource_link");
                    String resLinkId = (String) resourceLink.get("id");

                    LtiLaunch launch = ltiLaunchRepository
                            .findByPlatformIssuerAndUserSubAndResourceLinkId(issuer, sub, resLinkId)
                            .orElse(new LtiLaunch());

                    launch.setPlatformIssuer(issuer);
                    launch.setUserSub(sub);
                    launch.setResourceLinkId(resLinkId);
                    launch.setUser(user);
                    launch.setTargetLinkUri(targetLinkUri);
                    launch.setDeploymentId(
                            (String) claims.getClaim("https://purl.imsglobal.org/spec/lti/claim/deployment_id"));

                    // AGS
                    @SuppressWarnings("unchecked")
                    Map<String, Object> agsEndpoint = (Map<String, Object>) claims
                            .getClaim("https://purl.imsglobal.org/spec/lti-ags/claim/endpoint");
                    if (agsEndpoint != null) {
                        launch.setAgsLineItemUrl((String) agsEndpoint.get("lineitem"));
                        launch.setAgsLineItemsUrl((String) agsEndpoint.get("lineitems"));
                    }

                    // NRPS
                    @SuppressWarnings("unchecked")
                    Map<String, Object> nrpsEndpoint = (Map<String, Object>) claims
                            .getClaim("https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice");
                    if (nrpsEndpoint != null) {
                        launch.setNrpsMembershipUrl((String) nrpsEndpoint.get("context_memberships_url"));
                    }

                    ltiLaunchRepository.save(launch);
                    logger.info("💾 LTI Advantage context saved for user {} on platform {}", sub, issuer);

                } catch (Exception ex) {
                    logger.warn("⚠️ Failed to store LTI Advantage claims: {}", ex.getMessage());
                    // Don't fail the whole launch if Advantage claims are missing or malformed
                }

                return "TOKEN:" + token;
            }

        } catch (Exception e) {
            logger.error("LTI Launch Failed", e);
            throw new SecurityException("LTI Launch Failed: " + e.getMessage());
        }
    }

    protected void verifySignature(SignedJWT signedJWT, String jwksUrl) throws Exception {
        // Use Nimbus RemoteJWKSet to fetch and cache keys
        RemoteJWKSet<SecurityContext> jwkSet = new RemoteJWKSet<>(new java.net.URI(jwksUrl).toURL());
        JWSVerificationKeySelector<SecurityContext> keySelector = new JWSVerificationKeySelector<>(JWSAlgorithm.RS256,
                jwkSet);

        DefaultJWTProcessor<SecurityContext> jwtProcessor = new DefaultJWTProcessor<>();
        jwtProcessor.setJWSKeySelector(keySelector);

        // This will throw exception if signature is invalid
        jwtProcessor.process(signedJWT, null);
    }

    private void verifyClaims(JWTClaimsSet claims, String expectedAudience, String expectedDeploymentId)
            throws Exception {
        // Verify Audience
        List<String> aud = claims.getAudience();
        if (aud == null || !aud.contains(expectedAudience)) {
            throw new SecurityException("Invalid Audience. Expected " + expectedAudience);
        }

        // Verify Deployment ID (if configured)
        if (expectedDeploymentId != null && !expectedDeploymentId.isEmpty()) {
            String actualDeploymentId = (String) claims
                    .getClaim("https://purl.imsglobal.org/spec/lti/claim/deployment_id");
            if (!expectedDeploymentId.equals(actualDeploymentId)) {
                throw new SecurityException("Invalid Deployment ID. Expected " + expectedDeploymentId);
            }
        }

        // Verify Expiration
        Date exp = claims.getExpirationTime();
        if (exp != null && exp.before(new Date())) {
            throw new SecurityException("Token expired");
        }

        // Nonce check should ideally happen here (checking against cache)
    }

    @SuppressWarnings("unchecked")
    private String provisionUserAndGenerateToken(JWTClaimsSet claims) {
        String email = claims.getClaim("email") != null ? (String) claims.getClaim("email") : null;
        String sub = claims.getSubject();
        String name = claims.getClaim("name") != null ? (String) claims.getClaim("name") : "LTI User";

        Object rolesObj = claims.getClaim("https://purl.imsglobal.org/spec/lti/claim/roles");
        List<String> roles = (rolesObj instanceof List) ? (List<String>) rolesObj : Collections.emptyList();

        User user = provisionUser(email, sub, name, roles);

        // Generate App Token
        return jwtUtils.generateJwtToken(user.getUsername());
    }

    public User provisionUser(String email, String sub, String name, List<String> roles) {
        if (email == null) {
            email = sub + "@lti.user";
        }

        final String finalEmail = email;
        final String finalName = name;

        return userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(finalEmail);
            newUser.setUsername(finalEmail);

            String[] parts = finalName.split(" ", 2);
            newUser.setFirstName(parts[0]);
            newUser.setLastName(parts.length > 1 ? parts[1] : "");

            newUser.setPassword(UUID.randomUUID().toString());

            if (!roles.isEmpty() && (roles.contains("http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor")
                    || roles.contains("Instructor"))) {
                Role teacherRole = roleRepository.findByName("TEACHER").orElse(null);
                newUser.setRole(teacherRole);
            } else {
                Role studentRole = roleRepository.findByName("STUDENT").orElse(null);
                newUser.setRole(studentRole);
            }

            return userRepository.save(newUser);
        });
    }

    /**
     * NRPS: Sync members from LMS to EduFlex
     */
    public void syncMembers(String platformIssuer, String membershipsUrl, Long courseId) {
        com.eduflex.backend.dto.LtiMembershipResponse response = ltiNrpsService.getMemberships(platformIssuer,
                membershipsUrl);

        com.eduflex.backend.service.CourseService courseService = org.springframework.web.context.ContextLoader
                .getCurrentWebApplicationContext()
                .getBean(com.eduflex.backend.service.CourseService.class);

        if (response != null && response.getMembers() != null) {
            for (com.eduflex.backend.dto.LtiMembershipResponse.LtiMember member : response.getMembers()) {
                User user = provisionUser(member.getEmail(), member.getUser_id(), member.getName(), member.getRoles());
                // Enroll in course
                try {
                    courseService.addStudentToCourse(courseId, user.getId());
                } catch (Exception e) {
                    // Already enrolled or other minor issue
                }
            }
            logger.info("✅ Sync completed. Processed {} members for platform {} into Course {}",
                    response.getMembers().size(),
                    platformIssuer, courseId);
        }
    }

    // Generate Deep Linking Response JWT
    public String createDeepLinkingResponse(String platformIssuer, String deploymentId, String data,
            List<Map<String, Object>> contentItems) throws Exception {

        LtiPlatform platform = platformRepository.findByIssuer(platformIssuer)
                .orElseThrow(() -> new IllegalArgumentException("Unknown Platform Issuer: " + platformIssuer));

        // Create Header
        JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.RS256)
                .keyID(rsaKey.getKeyID())
                .type(new com.nimbusds.jose.JOSEObjectType("JWT"))
                .build();

        // Create Payload
        Date now = new Date();
        Date exp = new Date(now.getTime() + 300 * 1000); // 5 min expiration

        JWTClaimsSet.Builder claimsBuilder = new JWTClaimsSet.Builder()
                .issuer(platform.getClientId()) // We are the Issuer (Tool's Client ID)
                .audience(platform.getIssuer()) // The Platform is the Audience
                .issueTime(now)
                .expirationTime(exp)
                .jwtID(UUID.randomUUID().toString())
                .claim("https://purl.imsglobal.org/spec/lti/claim/message_type", "LtiDeepLinkingResponse")
                .claim("https://purl.imsglobal.org/spec/lti/claim/version", "1.3.0")
                .claim("https://purl.imsglobal.org/spec/lti/claim/deployment_id", deploymentId)
                .claim("https://purl.imsglobal.org/spec/lti-dl/claim/content_items", contentItems);

        // 'data' must be returned if present in request
        if (data != null) {
            claimsBuilder.claim("https://purl.imsglobal.org/spec/lti-dl/claim/data", data);
        }

        SignedJWT signedJWT = new SignedJWT(header, claimsBuilder.build());

        // Sign
        com.nimbusds.jose.JWSSigner signer = new com.nimbusds.jose.crypto.RSASSASigner(rsaKey);
        signedJWT.sign(signer);

        return signedJWT.serialize();
    }
}
