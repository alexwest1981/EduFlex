package com.eduflex.backend.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Converts Keycloak JWT tokens to Spring Security authentication tokens.
 * Extracts roles from the token and maps them to Spring Security authorities.
 */
@Component
public class KeycloakJwtAuthConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private static final String REALM_ACCESS_CLAIM = "realm_access";
    private static final String ROLES_CLAIM = "roles";
    private static final String RESOURCE_ACCESS_CLAIM = "resource_access";
    private static final String CLIENT_ID = "eduflex-app";

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = Stream.concat(
                extractRealmRoles(jwt).stream(),
                extractResourceRoles(jwt).stream()).collect(Collectors.toSet());

        return new JwtAuthenticationToken(jwt, authorities, extractPrincipalName(jwt));
    }

    /**
     * Extracts realm-level roles from the JWT.
     * These are roles defined at the Keycloak realm level.
     */
    private Collection<GrantedAuthority> extractRealmRoles(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim(REALM_ACCESS_CLAIM);
        if (realmAccess == null) {
            // Also check for direct 'roles' claim (custom protocol mapper)
            Object directRoles = jwt.getClaim(ROLES_CLAIM);
            if (directRoles instanceof List<?> rolesList) {
                return rolesList.stream()
                        .filter(role -> role instanceof String)
                        .map(role -> (String) role)
                        .flatMap(role -> Stream.of(
                                new SimpleGrantedAuthority(role),
                                new SimpleGrantedAuthority("ROLE_" + role)))
                        .collect(Collectors.toSet());
            }
            return Collections.emptySet();
        }

        Object roles = realmAccess.get(ROLES_CLAIM);
        if (roles instanceof List<?> rolesList) {
            return rolesList.stream()
                    .filter(role -> role instanceof String)
                    .map(role -> (String) role)
                    .flatMap(role -> Stream.of(
                            // Add both formats for compatibility with existing code
                            new SimpleGrantedAuthority(role),
                            new SimpleGrantedAuthority("ROLE_" + role)))
                    .collect(Collectors.toSet());
        }

        return Collections.emptySet();
    }

    /**
     * Extracts client-level roles from the JWT.
     * These are roles defined at the Keycloak client level.
     */
    @SuppressWarnings("unchecked")
    private Collection<GrantedAuthority> extractResourceRoles(Jwt jwt) {
        Map<String, Object> resourceAccess = jwt.getClaim(RESOURCE_ACCESS_CLAIM);
        if (resourceAccess == null) {
            return Collections.emptySet();
        }

        Map<String, Object> clientAccess = (Map<String, Object>) resourceAccess.get(CLIENT_ID);
        if (clientAccess == null) {
            return Collections.emptySet();
        }

        Object roles = clientAccess.get(ROLES_CLAIM);
        if (roles instanceof List<?> rolesList) {
            return rolesList.stream()
                    .filter(role -> role instanceof String)
                    .map(role -> (String) role)
                    .flatMap(role -> Stream.of(
                            new SimpleGrantedAuthority(role),
                            new SimpleGrantedAuthority("ROLE_" + role)))
                    .collect(Collectors.toSet());
        }

        return Collections.emptySet();
    }

    /**
     * Extracts the principal name from the JWT.
     * Uses preferred_username, then sub as fallback.
     */
    private String extractPrincipalName(Jwt jwt) {
        String preferredUsername = jwt.getClaimAsString("preferred_username");
        if (preferredUsername != null && !preferredUsername.isBlank()) {
            return preferredUsername;
        }
        return jwt.getSubject();
    }
}
