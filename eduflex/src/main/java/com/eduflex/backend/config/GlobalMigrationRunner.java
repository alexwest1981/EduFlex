package com.eduflex.backend.config;

import com.eduflex.backend.model.Tenant;
import com.eduflex.backend.repository.TenantRepository;
import com.eduflex.backend.service.TenantService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(1) // Run early in the startup process
public class GlobalMigrationRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(GlobalMigrationRunner.class);
    private final TenantRepository tenantRepository;
    private final TenantService tenantService;

    public GlobalMigrationRunner(TenantRepository tenantRepository, TenantService tenantService) {
        this.tenantRepository = tenantRepository;
        this.tenantService = tenantService;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("🚀 Starting Global Multi-Tenant Migration process...");

        // 1. Migrate Public Schema (Default)
        try {
            logger.info("📦 Migrating public schema...");
            tenantService.initTenantSchema("public", "Default Public Schema");
        } catch (Exception e) {
            logger.error("❌ Failed to migrate public schema: {}", e.getMessage());
        }

        // 2. Migrate all registered tenants
        List<Tenant> tenants = tenantRepository.findAll();
        logger.info("👥 Found {} tenants to migrate.", tenants.size());

        for (Tenant tenant : tenants) {
            if (tenant.getDbSchema() == null || "public".equals(tenant.getDbSchema())) {
                continue;
            }

            try {
                logger.info("📦 Migrating tenant: {} (Schema: {})", tenant.getName(), tenant.getDbSchema());
                tenantService.initTenantSchema(tenant.getDbSchema(), tenant.getName());
            } catch (Exception e) {
                logger.error("❌ Failed to migrate tenant {}: {}", tenant.getName(), e.getMessage());
                // Continue with other tenants to avoid blocking the whole app
            }
        }

        logger.info("✅ Global Migration process finished.");
    }
}
