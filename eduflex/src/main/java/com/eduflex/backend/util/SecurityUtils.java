package com.eduflex.backend.util;

import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

/**
 * Utility class for common security operations.
 */
public class SecurityUtils {

    /**
     * Gets the current authenticated user from the SecurityContext.
     * Supports both standard UserDetails (internal auth) and Jwt (Keycloak).
     *
     * @param userRepository Repository to look up the user in the database.
     * @return The User entity.
     * @throws ResponseStatusException 401 if not authenticated, 404 if user not
     *                                 found in DB.
     */
    public static User getCurrentUser(UserRepository userRepository) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        Object principal = auth.getPrincipal();
        String identifier = null;

        if (principal instanceof Jwt) {
            Jwt jwt = (Jwt) principal;
            // Keycloak usually has 'email' or 'preferred_username'
            identifier = jwt.getClaimAsString("email");
            if (identifier == null) {
                identifier = jwt.getClaimAsString("preferred_username");
            }
            if (identifier == null) {
                identifier = jwt.getSubject(); // Fallback to sub (UUID)
            }
        } else if (principal instanceof UserDetails) {
            identifier = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            identifier = (String) principal;
        }

        if (identifier == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User identity not found in token");
        }

        final String finalId = identifier;

        // Try looking up by email first, then username, then Keycloak ID if possible
        return userRepository.findByEmail(finalId)
                .or(() -> userRepository.findByUsername(finalId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + finalId));
    }

    /**
     * Checks if the current user has a specific authority.
     */
    public static boolean hasAuthority(String authority) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null)
            return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(authority) || a.getAuthority().equals("ROLE_" + authority));
    }
}
