package com.eduflex.backend.security;

import com.eduflex.backend.model.User;
import com.eduflex.backend.service.ApiKeyService;
import com.eduflex.backend.security.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private final ApiKeyService apiKeyService;
    private final CustomUserDetailsService userDetailsService;

    public ApiKeyAuthFilter(ApiKeyService apiKeyService, CustomUserDetailsService userDetailsService) {
        this.apiKeyService = apiKeyService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String apiKey = request.getHeader("X-API-KEY");

            // If header exists and no auth yet
            if (apiKey != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                User user = apiKeyService.validateKey(apiKey);

                if (user != null) {
                    // Load full UserDetails to get authorities
                    UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication via API Key: {}", e);
        }

        filterChain.doFilter(request, response);
    }
}
