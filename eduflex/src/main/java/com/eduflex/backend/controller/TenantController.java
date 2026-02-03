package com.eduflex.backend.controller;

import com.eduflex.backend.dto.TenantCreationRequest;
import com.eduflex.backend.model.Tenant;
import com.eduflex.backend.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenants")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Tag(name = "Tenant Management", description = "APIs for managing tenants")
public class TenantController {

    private final TenantService tenantService;

    @Autowired
    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(TenantController.class);

    @GetMapping
    @Operation(summary = "Get all tenants")
    public ResponseEntity<java.util.List<Tenant>> getAllTenants() {
        return ResponseEntity.ok(tenantService.getAllTenants());
    }

    @org.springframework.beans.factory.annotation.Value("${eduflex.registration.key:secret_key_123}")
    private String expectedRegistrationKey;

    @PostMapping
    @Operation(summary = "Create a new tenant", description = "Creates a new tenant entry and initializes schema + admin user. Requires Registration Key.")
    public ResponseEntity<?> createTenant(@Valid @RequestBody TenantCreationRequest request) {
        logger.info("Received tenant creation request for: {}", request.getName());

        // 1. Security Check
        String currentTenant = com.eduflex.backend.config.tenant.TenantContext.getCurrentTenant();
        if (currentTenant != null) {
            logger.warn("Attempt to create tenant from sub-tenant context: {}", currentTenant);
            return ResponseEntity.status(403)
                    .body(java.util.Map.of("error", "Tenant creation is only allowed from the main installation."));
        }

        // 2. Registration Key Check
        String incomingKey = request.getRegistrationKey() != null ? request.getRegistrationKey().trim() : null;

        if (expectedRegistrationKey != null && !expectedRegistrationKey.equals(incomingKey)) {
            logger.warn("Invalid registration key attempt for tenant: {}", request.getName());
            logger.debug("Expected Key: '{}' (len={}), Received Key: '{}' (len={})",
                    expectedRegistrationKey, expectedRegistrationKey.length(),
                    incomingKey, incomingKey != null ? incomingKey.length() : "null");
            return ResponseEntity.status(403).body(java.util.Map.of("error", "Invalid Registration Key"));
        }

        try {
            // 2. Create Tenant & Admin User
            // Note: tenantId = organizationKey from DTO logic
            Tenant tenant = tenantService.createTenant(
                    request.getName(),
                    request.getDomain(),
                    request.getDbSchema(),
                    request.getOrganizationKey(),
                    request.getAdminEmail(),
                    request.getAdminPassword(),
                    request.getAdminFirstName(),
                    request.getAdminLastName(),
                    null,
                    null);
            return ResponseEntity.ok(tenant);

        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(java.util.Map.of("error", e.getReason()));
        } catch (Exception e) {
            logger.error("Failed to create tenant", e);
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tenant by ID/Key")
    public ResponseEntity<Tenant> getTenant(@PathVariable String id) {
        try {
            return ResponseEntity.ok(tenantService.getTenant(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a tenant")
    public ResponseEntity<Void> deleteTenant(@PathVariable String id) {
        tenantService.deleteTenant(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/init-schema")
    @Operation(summary = "Initialize tenant schema")
    public ResponseEntity<Void> initSchema(@PathVariable String id) {
        tenantService.initSchema(id);
        return ResponseEntity.ok().build();
    }
}
