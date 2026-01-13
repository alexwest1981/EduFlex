package com.eduflex.backend.security;

import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final com.eduflex.backend.repository.RoleRepository roleRepository;

    public CustomOAuth2UserService(UserRepository userRepository,
            com.eduflex.backend.repository.RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        return processOAuth2User(registrationId, oAuth2User);
    }

    private OAuth2User processOAuth2User(String registrationId, OAuth2User oAuth2User) {
        String email;
        String name;

        // Handle different providers if needed, though most follow OIDC/Standard
        if ("github".equalsIgnoreCase(registrationId)) {
            Map<String, Object> attributes = oAuth2User.getAttributes();
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
            if (name == null)
                name = (String) attributes.get("login");
        } else {
            // Google and others
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
        }

        if (email == null || email.isEmpty()) {
            // Some providers (like GitHub) might verify emails via API call if null here.
            // For simplicity, we require email.
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Update stats
            user.setLastLogin(LocalDateTime.now());
            user.setLoginCount(user.getLoginCount() + 1);
            user = userRepository.save(user);
        } else {
            user = registerNewUser(email, name);
        }

        return new CustomOAuth2User(user, oAuth2User);
    }

    private User registerNewUser(String email, String name) {
        User user = new User();
        user.setUsername(email); // Use email as username for SSO users
        user.setEmail(email);

        // Simple name splitting
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

        user.setPassword(UUID.randomUUID().toString()); // strong random password
        user.setCreatedAt(LocalDateTime.now());

        // Initial stats
        user.setLastLogin(LocalDateTime.now());
        user.setLoginCount(1);

        // Assign default role (singular)
        com.eduflex.backend.model.Role studentRole = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> new RuntimeException("Default role STUDENT not found."));
        user.setRole(studentRole);

        return userRepository.save(user);
    }
}
