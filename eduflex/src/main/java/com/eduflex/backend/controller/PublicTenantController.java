package com.eduflex.backend.controller;

import com.eduflex.backend.dto.TenantCreationRequest;
import com.eduflex.backend.model.Tenant;
import com.eduflex.backend.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public/tenants")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Tag(name = "Public Tenant Registration", description = "Public APIs for self-service onboarding")
public class PublicTenantController {

    private static final Logger logger = LoggerFactory.getLogger(PublicTenantController.class);
    private final TenantService tenantService;

    @Autowired
    public PublicTenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new organization (Self-Service)", description = "Public endpoint to provision a new tenant.")
    public ResponseEntity<?> registerTenant(@Valid @RequestBody TenantCreationRequest request) {
        logger.info("Public registration attempt for: {}", request.getName());

        try {
            // 1. Validate Subdomain / Schema availability is handled by Service

            // 2. Default values if missing (Convention over Configuration)
            if (request.getOrganizationKey() == null) {
                // Generate from name or domain
                String key = request.getDomain().replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
                request.setOrganizationKey(key);
            }
            if (request.getDbSchema() == null) {
                request.setDbSchema("tenant_" + request.getOrganizationKey());
            }

            // 3. Create Tenant
            Tenant tenant = tenantService.createTenant(
                    request.getName(),
                    request.getDomain(),
                    request.getDbSchema(),
                    request.getOrganizationKey(),
                    request.getAdminEmail(),
                    request.getAdminPassword(),
                    request.getAdminFirstName(),
                    request.getAdminLastName());

            return ResponseEntity.ok(Map.of(
                    "message", "Organization registered successfully",
                    "tenantId", tenant.getId(),
                    "loginUrl", "http://" + tenant.getDomain() + ".eduflex.local/login" // Adjust dependent on domain
                                                                                        // logic
            ));

        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason()));
        } catch (Exception e) {
            logger.error("Public registration failed", e);
            return ResponseEntity.status(500).body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }
}
