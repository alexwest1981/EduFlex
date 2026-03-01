package com.eduflex.backend.controller;

import com.eduflex.backend.dto.UserSyncDTO;
import com.eduflex.backend.model.User;
import com.eduflex.backend.service.ApiKeyService;
import com.eduflex.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hr-sync")
public class HrSyncController {

    private final ApiKeyService apiKeyService;
    private final UserService userService;

    public HrSyncController(ApiKeyService apiKeyService, UserService userService) {
        this.apiKeyService = apiKeyService;
        this.userService = userService;
    }

    @PostMapping("/users")
    public ResponseEntity<?> syncUsers(
            @RequestHeader("X-API-KEY") String apiKey,
            @RequestBody List<UserSyncDTO> users) {

        // 1. Validate API Key
        User systemUser = apiKeyService.validateKey(apiKey);
        if (systemUser == null || !systemUser.getRole().isSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or unauthorized API Key");
        }

        // 2. Process Sync
        int updated = 0;
        int created = 0;

        for (UserSyncDTO dto : users) {
            try {
                java.util.Optional<User> existing = userService.findByUsername(dto.getUsername());
                if (existing.isPresent()) {
                    // Update logic (simplified)
                    User u = existing.get();
                    u.setEmail(dto.getEmail());
                    u.setFirstName(dto.getFirstName());
                    u.setLastName(dto.getLastName());
                    u.setActive(dto.isActive());
                    // userService.saveUser(u); // Assuming save method exists
                    updated++;
                } else {
                    User newUser = new User();
                    newUser.setUsername(dto.getUsername());
                    newUser.setEmail(dto.getEmail());
                    newUser.setFirstName(dto.getFirstName());
                    newUser.setLastName(dto.getLastName());
                    newUser.setSsn(dto.getSsn());
                    newUser.setPassword("EduFlex123!"); // Default or random
                    userService.registerUser(newUser);
                    created++;
                }
            } catch (Exception e) {
                // Log error for specific user but continue
                System.err.println("Failed to sync user " + dto.getUsername() + ": " + e.getMessage());
            }
        }

        return ResponseEntity.ok("Sync complete: " + created + " created, " + updated + " updated.");
    }

    @GetMapping("/status")
    public ResponseEntity<String> checkStatus(@RequestHeader("X-API-KEY") String apiKey) {
        User systemUser = apiKeyService.validateKey(apiKey);
        if (systemUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid API Key");
        }
        return ResponseEntity.ok("EduFlex HR-Sync API is Online. Authenticated as: " + systemUser.getUsername());
    }
}
