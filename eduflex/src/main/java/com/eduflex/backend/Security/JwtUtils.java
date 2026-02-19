
package com.eduflex.backend.security;

import io.jsonwebtoken.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @org.springframework.beans.factory.annotation.Value("${eduflex.jwt.secret}")
    private String jwtSecret;

    @org.springframework.beans.factory.annotation.Value("${eduflex.jwt.expiration}")
    private int jwtExpirationMs;

    public String generateJwtToken(Authentication authentication) {
        String username;
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else if (principal instanceof CustomOAuth2User) {
            username = ((CustomOAuth2User) principal).getUser().getUsername();
        } else if (principal instanceof CustomOidcUser) {
            username = ((CustomOidcUser) principal).getUser().getUsername();
        } else if (principal instanceof org.springframework.security.oauth2.core.oidc.user.OidcUser) {
            org.springframework.security.oauth2.core.oidc.user.OidcUser oidcUser = (org.springframework.security.oauth2.core.oidc.user.OidcUser) principal;
            username = oidcUser.getAttribute("email");
            if (username == null) {
                username = oidcUser.getAttribute("preferred_username");
            }
        } else {
            throw new IllegalArgumentException("Unknown principal type: " + principal.getClass());
        }

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateJwtToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generates a token specifically for OnlyOffice Document Server
     * 
     * @param payload The config map to sign
     * @return Signed JWT token
     */
    public String generateOnlyOfficeToken(java.util.Map<String, Object> payload) {
        return Jwts.builder()
                .setClaims(payload)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + 1000 * 60 * 60)) // 1 hour
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generates an OnlyOffice token with a custom secret (for matching the DS secret).
     */
    public String generateOnlyOfficeToken(java.util.Map<String, Object> payload, String customSecret) {
        Key customKey = io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                customSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        return Jwts.builder()
                .setClaims(payload)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + 1000 * 60 * 60)) // 1 hour
                .signWith(customKey, SignatureAlgorithm.HS256)
                .compact();
    }

    private Key key() {
        return io.jsonwebtoken.security.Keys.hmacShaKeyFor(jwtSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("JWT validation failed: {}", e.getMessage());
        }

        return false;
    }
}