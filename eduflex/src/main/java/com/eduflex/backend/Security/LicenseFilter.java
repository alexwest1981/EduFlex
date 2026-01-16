package com.eduflex.backend.security;

import com.eduflex.backend.service.LicenseService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class LicenseFilter extends OncePerRequestFilter {

    private final LicenseService licenseService;

    public LicenseFilter(LicenseService licenseService) {
        this.licenseService = licenseService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Om systemet är upplåst -> Kör vidare
        if (licenseService.isValid()) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Om systemet är LÅST (ingen giltig licens)
        String path = request.getRequestURI();

        // 3. Tillåt viktiga endpoints även utan licens:
        // - Auth (login/register) - användare måste kunna logga in
        // - License endpoints - för att kunna låsa upp
        // - Tenants - för att kunna registrera organisation
        // - Settings - för grundkonfiguration
        // - OPTIONS - CORS preflight
        if (path.startsWith("/api/auth")
                || path.startsWith("/api/tenants")
                || path.startsWith("/api/system/license")
                || path.startsWith("/api/settings")
                || path.startsWith("/api/branding")
                || path.startsWith("/actuator")
                || "OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // 4. Blockera allt annat
        System.out.println("⛔ BLOCKED: " + path + " (Reason: System Locked)");
        response.setStatus(402); // Payment Required (Signal to Frontend)
        response.setContentType("application/json");
        response.getWriter()
                .write("{\"error\": \"LICENSE_REQUIRED\", \"message\": \"System is locked. Valid license required.\"}");
    }
}