package com.eduflex.backend.config.tenant;

import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.stereotype.Component;

@Component
public class SchemaTenantIdentifierResolver implements CurrentTenantIdentifierResolver<String> {

    @Override
    public String resolveCurrentTenantIdentifier() {
        String tenant = TenantContext.getCurrentTenant();
        if (tenant != null) {
            return tenant;
        }
        return "public"; // Default schema
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return true;
    }
}
