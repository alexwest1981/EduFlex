package com.eduflex.backend.config;

import com.eduflex.backend.config.tenant.TenantContext;
import com.eduflex.backend.service.DemoDataService;
import com.eduflex.backend.service.TenantService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(10) // After core data initialization
public class DemoTenantBootstrapper implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DemoTenantBootstrapper.class);

    private final TenantService tenantService;
    private final DemoDataService demoDataService;

    @Autowired
    public DemoTenantBootstrapper(TenantService tenantService, DemoDataService demoDataService) {
        this.tenantService = tenantService;
        this.demoDataService = demoDataService;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("🛠️ Checking Demo Tenant status...");

        try {
            // 1. Ensure the 'demo' tenant entity and schema exist
            tenantService.ensureDemoTenantExists();

            // 2. Switch to demo context to populate data if empty
            // (Only if it's a fresh schema we might want to auto-populate)
            TenantContext.setCurrentTenant("tenant_demo");

            // Check if we already have demo data (e.g. check for a specific demo user)
            // For now, let's just trigger it once if certain conditions are met
            // OR provide a specific flag to skip.
            // Since this is for the March 4th meeting, we want it populated.

            logger.info("🇸🇪 Populating Demo Data for 'demo.eduflexlms.se'...");
            demoDataService.generateSwedishDemoData();

        } catch (Exception e) {
            logger.error("❌ Failed to bootstrap demo tenant: {}", e.getMessage(), e);
        } finally {
            TenantContext.clear();
        }
    }
}
