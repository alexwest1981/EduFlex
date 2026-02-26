package com.eduflex.backend.security;

import com.eduflex.backend.integration.model.IntegrationConfig;
import com.eduflex.backend.integration.repository.IntegrationConfigRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Custom ClientRegistrationRepository that delegates to an InMemory repository
 * (for properties)
 * and dynamically adds/overrides BankID registration from the database.
 */
@Component
@Primary
@Slf4j
public class DynamicClientRegistrationRepository implements ClientRegistrationRepository {

    private final IntegrationConfigRepository configRepository;
    private final InMemoryClientRegistrationRepository staticRepository;
    private final ObjectMapper objectMapper;

    public DynamicClientRegistrationRepository(
            IntegrationConfigRepository configRepository,
            org.springframework.beans.factory.ObjectProvider<InMemoryClientRegistrationRepository> staticRepositoryProvider,
            ObjectMapper objectMapper) {
        this.configRepository = configRepository;
        this.staticRepository = staticRepositoryProvider.getIfAvailable();
        this.objectMapper = objectMapper;
    }

    @Override
    public ClientRegistration findByRegistrationId(String registrationId) {
        // Only handle 'bankid' dynamically for now
        if ("bankid".equalsIgnoreCase(registrationId)) {
            return configRepository.findByPlatform("BANKID")
                    .filter(IntegrationConfig::isActive)
                    .map(this::toClientRegistration)
                    .orElseGet(() -> staticRepository != null ? staticRepository.findByRegistrationId(registrationId)
                            : null);
        }

        // Delegate others to static repository (Google, GitHub, Keycloak)
        return staticRepository != null ? staticRepository.findByRegistrationId(registrationId) : null;
    }

    private ClientRegistration toClientRegistration(IntegrationConfig config) {
        try {
            Map<String, String> settings = objectMapper.readValue(config.getSettings(), new TypeReference<>() {
            });

            String clientId = settings.getOrDefault("clientId", "placeholder-id");
            String clientSecret = settings.getOrDefault("clientSecret", "placeholder-secret");
            String issuerUrl = settings.getOrDefault("issuerUrl", "https://eduflex-sandbox.criipto.id"); // Default to
                                                                                                         // sandbox

            // Normalize issuer URL if needed
            if (issuerUrl.endsWith("/")) {
                issuerUrl = issuerUrl.substring(0, issuerUrl.length() - 1);
            }

            return ClientRegistration.withRegistrationId("bankid")
                    .clientId(clientId)
                    .clientSecret(clientSecret)
                    .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                    .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                    .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                    .scope("openid", "profile", "ssn")
                    .authorizationUri(issuerUrl + "/oauth2/authorize")
                    .tokenUri(issuerUrl + "/oauth2/token")
                    .userInfoUri(issuerUrl + "/oauth2/userinfo")
                    .jwkSetUri(issuerUrl + "/.well-known/jwks.json")
                    .clientName("BankID")
                    .build();
        } catch (Exception e) {
            log.error("❌ Failed to parse BankID settings for dynamic registration: {}", e.getMessage());
            // Fallback to static if parsing fails
            return staticRepository != null ? staticRepository.findByRegistrationId("bankid") : null;
        }
    }
}
