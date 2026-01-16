package com.eduflex.backend.config.tenant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TenantContext {

    private static final Logger logger = LoggerFactory.getLogger(TenantContext.class);
    private static final ThreadLocal<String> currentTenant = new ThreadLocal<>();

    public static void setCurrentTenant(String tenant) {
        logger.debug("Setting current tenant to: {}", tenant);
        currentTenant.set(tenant);
    }

    public static String getCurrentTenant() {
        return currentTenant.get();
    }

    public static void clear() {
        logger.debug("Clearing tenant context");
        currentTenant.remove();
    }
}
