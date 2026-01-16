package com.eduflex.backend.config.tenant;

import com.eduflex.backend.repository.TenantRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class TenantFilter extends OncePerRequestFilter {

    private final TenantRepository tenantRepository;

    @Autowired
    public TenantFilter(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String tenantId = request.getHeader("X-Tenant-ID");

        try {
            if (tenantId != null && !tenantId.isBlank()) {
                // Lookup Tenant to get the actual DB Schema name
                var tenantOpt = tenantRepository.findById(tenantId);

                if (tenantOpt.isPresent()) {
                    // Store the DB Schema name (e.g., "tenant_westcode") in the context
                    TenantContext.setCurrentTenant(tenantOpt.get().getDbSchema());
                } else {
                    // Invalid Tenant ID requested
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write("Invalid Tenant ID: " + tenantId);
                    return; // Stop processing
                }
            } else {
                // NO X-Tenant-ID header provided - fallback to 'public' schema
                // This allows existing users to use the system without multi-tenancy
                TenantContext.setCurrentTenant("public");
            }

            // Proceed with the chain (with or without tenant context)
            filterChain.doFilter(request, response);

        } finally {
            // CRITICAL: Always clear context to prevent memory leaks or cross-request
            // pollution
            TenantContext.clear();
        }
    }
}
