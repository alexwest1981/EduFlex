package com.eduflex.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String headerAuth = request.getHeader("Authorization");

            // Robust fallback: Scan all headers case-insensitively if direct lookup failed
            if (headerAuth == null) {
                java.util.Enumeration<String> scanNames = request.getHeaderNames();
                while (scanNames.hasMoreElements()) {
                    String name = scanNames.nextElement();
                    if ("authorization".equalsIgnoreCase(name)) {
                        headerAuth = request.getHeader(name);
                        break;
                    }
                }
            }

            if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
                String jwt = headerAuth.substring(7);
                if (jwtUtils.validateJwtToken(jwt)) {
                    String username = jwtUtils.getUserNameFromJwtToken(jwt);

                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.debug("✅ User '{}' authenticated via internal token", username);
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    // Check if we need parseJwt anymore, the logic is embedded above.
    // Keeping it valid java by removing the unused method if I removed calls to it.
    private String parseJwt(HttpServletRequest request) {
        // Kept for compatibility if used elsewhere, but doFilterInternal uses inline
        // logic now.
        return null;
    }
}