package com.eduflex.backend.service;

import com.eduflex.backend.model.LtiPlatform;
import com.eduflex.backend.model.Role;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.LtiPlatformRepository;
import com.eduflex.backend.repository.RoleRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.security.JwtUtils;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class LtiServiceTest {

        @Mock
        private LtiPlatformRepository platformRepository;

        @Mock
        private UserRepository userRepository;

        @Mock
        private RoleRepository roleRepository;

        @Mock
        private JwtUtils jwtUtils;

        @InjectMocks
        private LtiService ltiService;

        private RSAKey lmsRsaKey;

        @BeforeEach
        void setUp() throws Exception {
                MockitoAnnotations.openMocks(this);
                ltiService.init();

                KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
                gen.initialize(2048);
                KeyPair keyPair = gen.generateKeyPair();

                lmsRsaKey = new RSAKey.Builder((RSAPublicKey) keyPair.getPublic())
                                .privateKey((RSAPrivateKey) keyPair.getPrivate())
                                .keyID("lms-key-id")
                                .build();
        }

        @Test
        void testProcessLaunch_SuccessfulStudentLaunch() throws Exception {
                LtiPlatform platform = new LtiPlatform();
                platform.setIssuer("https://canvas.instructure.com");
                platform.setClientId("mock-client-id");
                platform.setJwksUrl("https://canvas.instructure.com/api/lti/security/jwks");

                when(platformRepository.findByIssuer(anyString())).thenReturn(Optional.of(platform));

                Role studentRole = new Role();
                studentRole.setName("STUDENT");
                when(roleRepository.findByName("STUDENT")).thenReturn(Optional.of(studentRole));

                when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
                when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);
                when(jwtUtils.generateJwtToken(anyString())).thenReturn("mock-app-token");

                JWTClaimsSet claims = new JWTClaimsSet.Builder()
                                .issuer("https://canvas.instructure.com")
                                .subject("user-123")
                                .audience("mock-client-id")
                                .expirationTime(new Date(new Date().getTime() + 3600 * 1000))
                                .claim("email", "student@test.com")
                                .claim("name", "Test Student")
                                .claim("https://purl.imsglobal.org/spec/lti/claim/message_type",
                                                "LtiResourceLinkRequest")
                                .claim("https://purl.imsglobal.org/spec/lti/claim/roles",
                                                List.of("http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"))
                                .build();

                SignedJWT signedJWT = new SignedJWT(
                                new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(lmsRsaKey.getKeyID()).build(),
                                claims);
                signedJWT.sign(new RSASSASigner(lmsRsaKey));
                String idToken = signedJWT.serialize();

                LtiService spyService = spy(ltiService);
                doNothing().when(spyService).verifySignature(any(SignedJWT.class), anyString());

                String result = spyService.processLaunch(idToken);

                assertEquals("TOKEN:mock-app-token", result);
        }
}
