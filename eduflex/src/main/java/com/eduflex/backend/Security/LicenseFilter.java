package com.eduflex.backend.security;

import com.eduflex.backend.service.LicenseService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class LicenseFilter extends HttpFilter {

    private final LicenseService licenseService;

    public LicenseFilter(LicenseService licenseService) {
        this.licenseService = licenseService;
    }

    @Override
    protected void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
        String path = request.getRequestURI();

        // Tillåt alltid licens-endpoints så man kan låsa upp systemet
        if (path.startsWith("/api/system/license") || "OPTIONS".equals(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        // Om systemet är aktivt -> kör som vanligt
        if (licenseService.isSystemActive()) {
            chain.doFilter(request, response);
        } else {
            // Annars blockera med 503 Service Unavailable
            response.setStatus(503);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"System locked. License required.\"}");
        }
    }
}