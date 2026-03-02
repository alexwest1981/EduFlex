package com.eduflex.backend.security;

import com.eduflex.backend.model.User;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.ws.rs.core.Response;
import java.util.Collections;
import java.util.List;

/**
 * Service for administrative CRUD operations in Keycloak.
 * Used to keep Keycloak in sync with EduFlex user data.
 */
@Service
public class KeycloakService {

    @Value("${spring.security.oauth2.client.provider.keycloak.issuer-uri:http://localhost:8180/realms/eduflex}")
    private String serverUrl;

    @Value("${eduflex.keycloak.realm:eduflex}")
    private String realm;

    @Value("${eduflex.keycloak.admin-username:admin}")
    private String adminUsername;

    @Value("${eduflex.keycloak.admin-password:123}")
    private String adminPassword;

    @Value("${eduflex.keycloak.client-id:admin-cli}")
    private String clientId;

    private Keycloak getKeycloakInstance() {
        // Base URL logic: Issuer URI is usually http://localhost:8180/realms/eduflex
        // Keycloak builder needs the base server URL (http://localhost:8180)
        String baseUrl = serverUrl.split("/realms/")[0];

        return KeycloakBuilder.builder()
                .serverUrl(baseUrl)
                .realm("master") // Admin login usually via master realm
                .username(adminUsername)
                .password(adminPassword)
                .clientId(clientId)
                .build();
    }

    /**
     * Synchronizes a user to Keycloak. Creates if not exists, updates if exists.
     */
    public String syncUser(User user, String plaintextPassword) {
        Keycloak keycloak = getKeycloakInstance();

        // Check if user already exists
        List<UserRepresentation> existing = keycloak.realm(realm).users().search(user.getUsername());

        UserRepresentation kcUser = new UserRepresentation();
        kcUser.setUsername(user.getUsername());
        kcUser.setEmail(user.getEmail());
        kcUser.setFirstName(user.getFirstName());
        kcUser.setLastName(user.getLastName());
        kcUser.setEnabled(user.getIsActive());

        if (existing.isEmpty()) {
            // Create user
            Response response = keycloak.realm(realm).users().create(kcUser);
            if (response.getStatus() == 201) {
                String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");

                // Set password if provided
                if (plaintextPassword != null && !plaintextPassword.isEmpty()) {
                    resetPassword(userId, plaintextPassword);
                }

                return userId;
            } else {
                throw new RuntimeException("Failed to create user in Keycloak: " + response.getStatusInfo());
            }
        } else {
            // Update user
            String kcUserId = existing.get(0).getId();
            keycloak.realm(realm).users().get(kcUserId).update(kcUser);

            // Set password if provided
            if (plaintextPassword != null && !plaintextPassword.isEmpty()) {
                resetPassword(kcUserId, plaintextPassword);
            }

            return kcUserId;
        }
    }

    /**
     * Resets a user's password in Keycloak.
     */
    public void resetPassword(String kcUserId, String newPassword) {
        Keycloak keycloak = getKeycloakInstance();
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(newPassword);
        credential.setTemporary(false);

        keycloak.realm(realm).users().get(kcUserId).resetPassword(credential);
    }

    /**
     * Deletes a user from Keycloak.
     */
    public void deleteUser(String kcUserId) {
        if (kcUserId == null || kcUserId.isEmpty())
            return;

        Keycloak keycloak = getKeycloakInstance();
        keycloak.realm(realm).users().get(kcUserId).remove();
    }
}
