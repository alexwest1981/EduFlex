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

    @PostMapping
    @Operation(summary = "Create a new tenant", description = "Creates a new tenant entry (schema init separate or auto).")
    public ResponseEntity<Tenant> createTenant(@RequestBody com.eduflex.backend.dto.TenantCreationRequest request) { // Använder
                                                                                                                     // TenantCreationRequest
                                                                                                                     // men
                                                                                                                     // kanske
                                                                                                                     // behöver
                                                                                                                     // anpassas
        // TODO: Mappa om requesten ordentligt
        logger.info("Received tenant creation request: {}", request.getName());
        // Förenklad create för nu
        // Vi måste kanske uppdatera TenantService.createTenant signaturen också
        // För tillfället antar vi att vi vill skapa tenant-objektet

        // Temporär fulhack för att matcha det frontend skickar (name, tenantId, schema)
        // Vi återkommer till detta.
        Tenant tenant = tenantService.createTenantRaw(request.getName(), request.getTenantId(), request.getSchema());
        return ResponseEntity.ok(tenant);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a tenant")
    public ResponseEntity<Void> deleteTenant(@PathVariable Long id) {
        tenantService.deleteTenant(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/init-schema")
    @Operation(summary = "Initialize tenant schema")
    public ResponseEntity<Void> initSchema(@PathVariable Long id) {
        tenantService.initSchema(id);
        return ResponseEntity.ok().build();
    }
}
