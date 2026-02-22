package com.eduflex.backend.config.tenant;

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

    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Autowired
    public TenantFilter(javax.sql.DataSource dataSource) {
        this.jdbcTemplate = new org.springframework.jdbc.core.JdbcTemplate(dataSource);
    }

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(TenantFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String tenantId = request.getHeader("X-Tenant-ID");

        // Fallback to query param
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = request.getParameter("tenantId");
        }

        // Fallback to Domain-based resolution (t.ex. demo.eduflexlms.se)
        if (tenantId == null || tenantId.isBlank()) {
            String serverName = request.getServerName();

            // Check ServerName (Host header)
            if (serverName != null && serverName.endsWith(".eduflexlms.se")) {
                tenantId = extractSubdomain(serverName);
            }

            // Fallback to Referer or Origin if api.eduflexlms.se is used
            if (tenantId == null || tenantId.isBlank() || "api".equalsIgnoreCase(tenantId)) {
                String referer = request.getHeader("Referer");
                String origin = request.getHeader("Origin");

                if (referer != null && referer.contains(".eduflexlms.se")) {
                    tenantId = extractSubdomainFromUrl(referer);
                    logger.debug("🌐 Resolved from Referer: {} -> {}", referer, tenantId);
                } else if (origin != null && origin.contains(".eduflexlms.se")) {
                    tenantId = extractSubdomainFromUrl(origin);
                    logger.debug("🌐 Resolved from Origin: {} -> {}", origin, tenantId);
                }
            }
        }

        // Log query string for debug if needed, but remove force-set logic
        if (tenantId != null) {
            logger.debug("👉 TenantFilter: Resolved tenantId: {}", tenantId);
        }

        try {
            if (tenantId != null && !tenantId.isBlank()) {
                try {
                    // Direct JDBC lookup to avoid Hibernate recursion/overhead
                    String sql = "SELECT db_schema FROM public.tenants WHERE id = ?";
                    String schema = jdbcTemplate.queryForObject(sql, String.class, tenantId);

                    if (schema != null) {
                        TenantContext.setCurrentTenant(schema);
                        logger.debug("✅ TenantFilter: set schema to {}", schema);
                    }
                } catch (org.springframework.dao.DataAccessException e) {
                    // Handle invalid UUIDs or not found users gracefully
                    logger.warn("❌ TenantFilter: Tenant ID lookup failed (ID: {}). fallback to public. Error: {}",
                            tenantId, e.getMessage());
                    TenantContext.setCurrentTenant("public");
                } catch (Exception e) {
                    logger.error("💥 TenantFilter JDBC Error: {}", e.getMessage(), e);
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    return;
                }
            } else {
                TenantContext.setCurrentTenant("public");
            }

            filterChain.doFilter(request, response);

        } finally {
            TenantContext.clear();
        }
    }

    private String extractSubdomain(String host) {
        if (host != null && host.endsWith(".eduflexlms.se")) {
            String sub = host.substring(0, host.indexOf(".eduflexlms.se"));
            if (!sub.isEmpty() && !"www".equalsIgnoreCase(sub) && !"api".equalsIgnoreCase(sub)) {
                return sub;
            }
        }
        return null;
    }

    private String extractSubdomainFromUrl(String url) {
        try {
            java.net.URL u = java.net.URI.create(url).toURL();
            return extractSubdomain(u.getHost());
        } catch (Exception e) {
            return null;
        }
    }
}
