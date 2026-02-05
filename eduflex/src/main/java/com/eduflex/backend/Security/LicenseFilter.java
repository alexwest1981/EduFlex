package com.eduflex.backend.security;

import com.eduflex.backend.service.LicenseService;
import com.eduflex.backend.util.RuntimeGuard;
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
    private final RuntimeGuard runtimeGuard;

    public LicenseFilter(LicenseService licenseService, RuntimeGuard runtimeGuard) {
        this.licenseService = licenseService;
        this.runtimeGuard = runtimeGuard;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // --- ANTI-RE: RUNTIME CHECK ---
        if (runtimeGuard != null) {
            runtimeGuard.validateIntegrity();
        }
        // ------------------------------

        try {
            // 1. Om systemet är upplåst -> Kör vidare
            if (licenseService.isValid()) {
                filterChain.doFilter(request, response);
                return;
            }

            // 2. Om systemet är LÅST (ingen giltig licens)
            String path = request.getRequestURI();
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
            System.err.println("⛔ BLOCKED: " + path + " (Systemet är låst pga licensfel)");
            response.setStatus(402); // Payment Required
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter()
                    .write("{\"error\": \"INVALID_LICENSE\", \"message\": \"Systemet är låst. Din licens är ogiltig eller obetald. Kontakta EduFlex support.\"}");
        } catch (Exception e) {
            String path = request.getRequestURI();
            System.err.println("❌ ERROR in LicenseFilter [" + path + "]: " + e.getMessage());
            e.printStackTrace();
            // Re-throw to allow Spring Security / Spring Web to handle it correctly (e.g.
            // generate JSON 500)
            throw new RuntimeException("LicenseFilter Error at " + path, e);
        }
    }
}