package com.eduflex.backend.controller;

import com.eduflex.backend.model.ApiKey;
import com.eduflex.backend.model.User;
import com.eduflex.backend.service.ApiKeyService;
import com.eduflex.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/developer")
@Tag(name = "Developer API", description = "Manage API integration keys")
public class DeveloperController {

    private final ApiKeyService apiKeyService;
    private final UserService userService;

    public DeveloperController(ApiKeyService apiKeyService, UserService userService) {
        this.apiKeyService = apiKeyService;
        this.userService = userService;
    }

    @GetMapping("/keys")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List API Keys", description = "List all active API keys for the current user.")
    public ResponseEntity<List<ApiKey>> getKeys(Principal principal) {
        User user = userService.getUserByUsername(principal.getName());
        return ResponseEntity.ok(apiKeyService.getMyKeys(user));
    }

    @PostMapping("/keys")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Generate API Key", description = "Generates a new API key. Returns the raw key ONCE.")
    public ResponseEntity<Map<String, String>> generateKey(@RequestBody Map<String, String> request,
            Principal principal) {
        User user = userService.getUserByUsername(principal.getName());
        String name = request.getOrDefault("name", "My API Key");

        String rawKey = apiKeyService.createKey(user, name);

        return ResponseEntity.ok(Map.of(
                "key", rawKey,
                "message", "This key will only be shown once. Copy it now."));
    }

    @DeleteMapping("/keys/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Revoke API Key", description = "Revokes and deletes an API key.")
    public ResponseEntity<Void> revokeKey(@PathVariable Long id, Principal principal) {
        User user = userService.getUserByUsername(principal.getName());
        apiKeyService.revokeKey(id, user);
        return ResponseEntity.noContent().build();
    }
}
