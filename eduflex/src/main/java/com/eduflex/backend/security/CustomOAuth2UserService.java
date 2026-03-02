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
    private final com.eduflex.backend.repository.UserBankIdIdentityRepository bankIdRepository;

    public CustomOAuth2UserService(UserRepository userRepository,
            com.eduflex.backend.repository.RoleRepository roleRepository,
            com.eduflex.backend.repository.UserBankIdIdentityRepository bankIdRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.bankIdRepository = bankIdRepository;
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        return processOAuth2User(registrationId, oAuth2User);
    }

    private OAuth2User processOAuth2User(String registrationId, OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Handle specific provider differences if needed
        if ("github".equalsIgnoreCase(registrationId)) {
            Map<String, Object> attributes = oAuth2User.getAttributes();
            if (name == null)
                name = (String) attributes.get("login");
        }

        // NEW: Check for SSN attribute. If present, we treat it as a BankID/Identity
        // login
        // regardless of the registrationId (e.g. if Keycloak is used as a broker for
        // BankID)
        String ssn = oAuth2User.getAttribute("ssn");
        if (ssn == null)
            ssn = oAuth2User.getAttribute("personal_number");

        if (ssn != null) {
            return handleBankIdUser(registrationId, oAuth2User);
        }

        if (email == null || email.isEmpty()) {
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

    private OAuth2User handleBankIdUser(String registrationId, OAuth2User oAuth2User) {
        String ssn = (String) oAuth2User.getAttribute("ssn");
        if (ssn == null)
            ssn = (String) oAuth2User.getAttribute("personal_number");
        if (ssn == null)
            ssn = (String) oAuth2User.getAttribute("sub");

        if (ssn == null) {
            throw new OAuth2AuthenticationException("BankID: SSN not found in attributes");
        }

        // Use SHA-256 for searching
        String ssnHash = org.apache.commons.codec.digest.DigestUtils.sha256Hex(ssn);

        Optional<com.eduflex.backend.model.UserBankIdIdentity> identityOptional = bankIdRepository
                .findBySsnHash(ssnHash);
        User user;

        if (identityOptional.isPresent()) {
            user = identityOptional.get().getUser();
            user.setLastLogin(LocalDateTime.now());
            user.setLoginCount(user.getLoginCount() + 1);
            user = userRepository.save(user);
        } else {
            // For Sandbox: create a dummy email if none provided
            String name = oAuth2User.getAttribute("name");
            String email = oAuth2User.getAttribute("email");
            if (email == null)
                email = "bankid-" + ssnHash.substring(0, 8) + "@eduflexlms.se";

            user = registerNewUser(email, name);
            user.setSsn(ssn); // Optional: store encrypted ssn for reference
            user = userRepository.save(user);

            // Link BankID identity
            bankIdRepository.save(new com.eduflex.backend.model.UserBankIdIdentity(user, ssnHash));
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
