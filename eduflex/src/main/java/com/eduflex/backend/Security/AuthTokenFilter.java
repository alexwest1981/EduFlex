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
import jakarta.servlet.http.HttpServletRequestWrapper;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.ArrayList;

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

        // Skip filter for OnlyOffice endpoints to avoid incorrect JWT validation
        String path = request.getRequestURI();
        if (path.startsWith("/api/onlyoffice/")) {
            filterChain.doFilter(request, response);
            return;
        }

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

                    // Successfully authenticated via internal token.
                    // To prevent BearerTokenAuthenticationFilter from trying (and failing)
                    // to validate this as an OAuth2 token in hybrid mode, we wrap the request
                    // to effectively "consume" the Authorization header.
                    HttpServletRequest wrapper = new HttpServletRequestWrapper(request) {
                        @Override
                        public String getHeader(String name) {
                            if ("Authorization".equalsIgnoreCase(name)) {
                                return null;
                            }
                            return super.getHeader(name);
                        }

                        @Override
                        public Enumeration<String> getHeaderNames() {
                            List<String> names = Collections.list(super.getHeaderNames());
                            names.removeIf(n -> "Authorization".equalsIgnoreCase(n));
                            return Collections.enumeration(names);
                        }

                        @Override
                        public Enumeration<String> getHeaders(String name) {
                            if ("Authorization".equalsIgnoreCase(name)) {
                                return Collections.emptyEnumeration();
                            }
                            return super.getHeaders(name);
                        }
                    };
                    filterChain.doFilter(wrapper, response);
                    return;
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
        }

        // Neutralize corrupted frontend tokens to prevent OAuth2 filters from throwing
        // 500
        String headerAuth = request.getHeader("Authorization");
        if (headerAuth != null) {
            if (headerAuth.equalsIgnoreCase("Bearer null") ||
                    headerAuth.equalsIgnoreCase("Bearer undefined") ||
                    headerAuth.equalsIgnoreCase("Bearer [object Object]")) {

                HttpServletRequest wrapper = wrapRequestToHideAuth(request);
                filterChain.doFilter(wrapper, response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private HttpServletRequest wrapRequestToHideAuth(HttpServletRequest request) {
        return new HttpServletRequestWrapper(request) {
            @Override
            public String getHeader(String name) {
                if ("Authorization".equalsIgnoreCase(name)) {
                    return null;
                }
                return super.getHeader(name);
            }

            @Override
            public Enumeration<String> getHeaderNames() {
                List<String> names = new ArrayList<>(Collections.list(super.getHeaderNames()));
                names.removeIf(n -> "Authorization".equalsIgnoreCase(n));
                return Collections.enumeration(names);
            }

            @Override
            public Enumeration<String> getHeaders(String name) {
                if ("Authorization".equalsIgnoreCase(name)) {
                    return Collections.emptyEnumeration();
                }
                return super.getHeaders(name);
            }
        };
    }

    // Check if we need parseJwt anymore, the logic is embedded above.
    // Keeping it valid java by removing the unused method if I removed calls to it.
    private String parseJwt(HttpServletRequest request) {
        // Kept for compatibility if used elsewhere, but doFilterInternal uses inline
        // logic now.
        return null;
    }
}