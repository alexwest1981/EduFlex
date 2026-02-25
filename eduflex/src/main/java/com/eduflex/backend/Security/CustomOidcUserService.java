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
    private final com.eduflex.backend.repository.UserBankIdIdentityRepository bankIdRepository;

    public CustomOidcUserService(UserRepository userRepository,
            com.eduflex.backend.repository.RoleRepository roleRepository,
            com.eduflex.backend.repository.UserBankIdIdentityRepository bankIdRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.bankIdRepository = bankIdRepository;
    }

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        User user = processOidcUser(registrationId, oidcUser);
        return new CustomOidcUser(oidcUser, user);
    }

    private User processOidcUser(String registrationId, OidcUser oidcUser) {
        String email = oidcUser.getAttribute("email");
        String name = oidcUser.getAttribute("name");

        if (email == null || email.isEmpty()) {
            if ("bankid".equalsIgnoreCase(registrationId)) {
                return handleBankIdUser(oidcUser);
            }
            email = oidcUser.getAttribute("preferred_username");
        }

        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationException("Email not found from OIDC provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setLastLogin(LocalDateTime.now());
            user.setLoginCount(user.getLoginCount() + 1);
            return userRepository.save(user);
        } else {
            return registerNewUser(email, name);
        }
    }

    private User handleBankIdUser(OidcUser oidcUser) {
        String ssn = (String) oidcUser.getAttribute("ssn");
        if (ssn == null)
            ssn = (String) oidcUser.getAttribute("personal_number");
        if (ssn == null)
            ssn = (String) oidcUser.getSubject();

        if (ssn == null) {
            throw new OAuth2AuthenticationException("BankID: SSN not found in OIDC claims");
        }

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
            String name = oidcUser.getAttribute("name");
            String email = "bankid-" + ssnHash.substring(0, 8) + "@eduflexlms.se";
            user = registerNewUser(email, name);
            user.setSsn(ssn);
            user = userRepository.save(user);
            bankIdRepository.save(new com.eduflex.backend.model.UserBankIdIdentity(user, ssnHash));
        }

        return user;
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
