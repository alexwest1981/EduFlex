package com.eduflex.backend.service;

import com.eduflex.backend.model.LtiPlatform;
import com.eduflex.backend.model.User;
import com.eduflex.backend.model.Role;
import com.eduflex.backend.repository.LtiPlatformRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.repository.RoleRepository;
import com.eduflex.backend.security.JwtUtils;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jose.proc.SimpleSecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URL;
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
    private final JwtUtils jwtUtils;

    @Autowired
    public LtiService(LtiPlatformRepository platformRepository, UserRepository userRepository,
            RoleRepository roleRepository, JwtUtils jwtUtils) {
        this.platformRepository = platformRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtUtils = jwtUtils;
    }

    @PostConstruct
    public void init() {
        try {
            // Generate a 2048-bit RSA key pair for signing OUR requests to LMS (if needed
            // for Deep Linking etc)
            KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
            gen.initialize(2048);
            KeyPair keyPair = gen.generateKeyPair();

            // Convert to JWK format
            rsaKey = new RSAKey.Builder((RSAPublicKey) keyPair.getPublic())
                    .privateKey((RSAPrivateKey) keyPair.getPrivate())
                    .keyUse(KeyUse.SIGNATURE)
                    .algorithm(JWSAlgorithm.RS256)
                    .keyID(UUID.randomUUID().toString())
                    .build();

            jwkSet = new JWKSet(rsaKey);

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate LTI keys", e);
        }
    }

    public Map<String, Object> getJwkSet() {
        return jwkSet.toJSONObject();
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

            // 3. Verify Signature using Platform's JWKS
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
            verifyClaims(claims, platform.getClientId());

            // 5. User Provisioning
            return provisionUserAndGenerateToken(claims);

        } catch (Exception e) {
            logger.error("LTI Launch Failed", e);
            throw new SecurityException("LTI Launch Failed: " + e.getMessage());
        }
    }

    private void verifySignature(SignedJWT signedJWT, String jwksUrl) throws Exception {
        // Use Nimbus RemoteJWKSet to fetch and cache keys
        RemoteJWKSet<SecurityContext> jwkSet = new RemoteJWKSet<>(new java.net.URI(jwksUrl).toURL());
        JWSVerificationKeySelector<SecurityContext> keySelector = new JWSVerificationKeySelector<>(JWSAlgorithm.RS256,
                jwkSet);

        DefaultJWTProcessor<SecurityContext> jwtProcessor = new DefaultJWTProcessor<>();
        jwtProcessor.setJWSKeySelector(keySelector);

        // This will throw exception if signature is invalid
        jwtProcessor.process(signedJWT, null);
    }

    private void verifyClaims(JWTClaimsSet claims, String expectedAudience) throws Exception {
        // Verify Audience
        List<String> aud = claims.getAudience();
        if (aud == null || !aud.contains(expectedAudience)) {
            // Some LMSs send array, some string. Nimbus handles conversion but list check
            // is safest.
            throw new SecurityException("Invalid Audience. Expected " + expectedAudience);
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

        // Basic LTI Role Mapping
        // LTI roles are usually URIs. e.g.
        // http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor
        Object rolesObj = claims.getClaim("https://purl.imsglobal.org/spec/lti/claim/roles");
        List<String> roles = (rolesObj instanceof List) ? (List<String>) rolesObj : Collections.emptyList();

        if (email == null) {
            email = sub + "@lti.user"; // Fallback if email not provided
        }

        final String finalEmail = email;
        final String finalName = name;

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            // Create new user
            User newUser = new User();
            newUser.setEmail(finalEmail);
            newUser.setUsername(finalEmail);

            // Split name into First/Last
            String[] parts = finalName.split(" ", 2);
            newUser.setFirstName(parts[0]);
            newUser.setLastName(parts.length > 1 ? parts[1] : "");

            newUser.setPassword(UUID.randomUUID().toString()); // Random password, they use LTI

            // Determine Role
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

        // Generate App Token
        return jwtUtils.generateJwtToken(user.getUsername());
    }
}
