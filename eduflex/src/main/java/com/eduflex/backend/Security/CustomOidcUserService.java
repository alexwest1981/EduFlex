package com.eduflex.backend.security;

import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;
    private final com.eduflex.backend.repository.RoleRepository roleRepository;

    public CustomOidcUserService(UserRepository userRepository,
            com.eduflex.backend.repository.RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        // Delegate to the default implementation for loading the user
        OidcUser oidcUser = super.loadUser(userRequest);

        // Synchronize with local database
        processOidcUser(oidcUser);

        return oidcUser;
    }

    private void processOidcUser(OidcUser oidcUser) {
        String email = oidcUser.getAttribute("email");
        String name = oidcUser.getAttribute("name");

        if (email == null || email.isEmpty()) {
            // Fallback to "preferred_username" if email is missing (common in some keycloak
            // configs)
            email = oidcUser.getAttribute("preferred_username");
        }

        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationException("Email not found from OIDC provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // Update existing user if needed (e.g. name change)
            // user.setFirstName(...);
            // userRepository.save(user);
        } else {
            registerNewUser(email, name);
        }
    }

    private User registerNewUser(String email, String name) {
        User user = new User();
        user.setUsername(email); // Use email as username for SSO
        user.setEmail(email);

        if (name != null) {
            String[] parts = name.split(" ", 2);
            user.setFirstName(parts[0]);
            if (parts.length > 1) {
                user.setLastName(parts[1]);
            } else {
                user.setLastName("");
            }
        } else {
            user.setFirstName("SSO");
            user.setLastName("User");
        }

        user.setPassword(UUID.randomUUID().toString());
        user.setCreatedAt(LocalDateTime.now());

        // Assign default role
        com.eduflex.backend.model.Role studentRole = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> new RuntimeException("Default role STUDENT not found."));
        user.setRole(studentRole);

        return userRepository.save(user);
    }
}
