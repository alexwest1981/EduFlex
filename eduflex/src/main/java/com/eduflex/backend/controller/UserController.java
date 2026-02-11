package com.eduflex.backend.controller;

import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final com.eduflex.backend.repository.RoleRepository roleRepository;

    @Autowired
    public UserController(UserService userService, UserRepository userRepository,
            com.eduflex.backend.repository.RoleRepository roleRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @PostMapping("/register")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<User> registerUser(@RequestBody Map<String, Object> payload) {
        try {
            User user = new User();
            user.setFirstName((String) payload.get("firstName"));
            user.setLastName((String) payload.get("lastName"));
            user.setUsername((String) payload.get("username"));
            user.setEmail((String) payload.get("email"));
            user.setPassword((String) payload.get("password"));

            // Handle optional fields
            if (payload.containsKey("ssn"))
                user.setSsn((String) payload.get("ssn"));
            if (payload.containsKey("phone"))
                user.setPhone((String) payload.get("phone"));
            if (payload.containsKey("address"))
                user.setAddress((String) payload.get("address"));

            // NYTT: Hantera Roll Lookup
            if (payload.containsKey("role")) {
                String roleName = (String) payload.get("role");
                com.eduflex.backend.model.Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Roll ej funnen: " + roleName));
                user.setRole(role);
            } else {
                // Fallback if no role is sent (UserService sets STUDENT if null, but let's be
                // explicit)
                // Actually, letting UserService handle default is safer if we want centralized
                // logic,
                // but here we want to allow Admin to set it.
            }

            User createdUser = userService.registerUser(user);
            return ResponseEntity.ok(createdUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/generate-usernames")
    public ResponseEntity<List<String>> generateUsernames(@RequestBody Map<String, String> payload) {
        String firstName = payload.get("firstName");
        String lastName = payload.get("lastName");
        String ssn = payload.get("ssn");
        if (firstName == null || lastName == null || ssn == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(userService.generateUsernameSuggestions(firstName, lastName, ssn));
    }

    @GetMapping
    public Page<User> getAllUsers(@PageableDefault(size = 20) Pageable pageable) {
        return userService.getAllUsers(pageable);
    }

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(
            @RequestParam("query") String query,
            @RequestParam(value = "role", required = false) String role) {
        if (query == null || query.trim().length() < 1) {
            return ResponseEntity.badRequest().build();
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN") || a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            return ResponseEntity.ok(userService.searchUsersForAdmin(query, role));
        }

        return ResponseEntity.ok(userService.searchUsers(query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.getUserById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/related")
    public ResponseEntity<List<User>> getRelatedUsers() {
        try {
            String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getName();
            User currentUser = userRepository.findByUsername(username).orElseThrow();
            return ResponseEntity.ok(userService.getContactsForUser(currentUser.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // --- UPPDATERAD METOD: Nu med isActive och Role ---
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return userRepository.findById(id).map(user -> {
            if (updates.containsKey("firstName"))
                user.setFirstName((String) updates.get("firstName"));
            if (updates.containsKey("lastName"))
                user.setLastName((String) updates.get("lastName"));
            if (updates.containsKey("email"))
                user.setEmail((String) updates.get("email"));
            if (updates.containsKey("phone"))
                user.setPhone((String) updates.get("phone"));
            if (updates.containsKey("address"))
                user.setAddress((String) updates.get("address"));
            if (updates.containsKey("language"))
                user.setLanguage((String) updates.get("language"));
            if (updates.containsKey("username"))
                user.setUsername((String) updates.get("username"));

            // NYTT: Hantera Roll
            if (updates.containsKey("role")) {
                String roleName = (String) updates.get("role");
                com.eduflex.backend.model.Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Roll ej funnen: " + roleName));
                user.setRole(role);
            }

            // NYTT: Hantera Aktiv/Inaktiv
            if (updates.containsKey("isActive")) {
                Object activeVal = updates.get("isActive");
                if (activeVal instanceof Boolean) {
                    user.setActive((Boolean) activeVal);
                } else {
                    user.setActive(Boolean.parseBoolean(activeVal.toString()));
                }
            }

            // NYTT: Hantera Settings (Dashboard anpassning)
            if (updates.containsKey("settings")) {
                user.setSettings((String) updates.get("settings"));
            }

            // NYTT: Social Media
            if (updates.containsKey("linkedinUrl"))
                user.setLinkedinUrl((String) updates.get("linkedinUrl"));
            if (updates.containsKey("instagramUrl"))
                user.setInstagramUrl((String) updates.get("instagramUrl"));
            if (updates.containsKey("facebookUrl"))
                user.setFacebookUrl((String) updates.get("facebookUrl"));
            if (updates.containsKey("twitterUrl"))
                user.setTwitterUrl((String) updates.get("twitterUrl"));

            // NYTT: Hantera Storage Quota
            if (updates.containsKey("storageQuota")) {
                Object quotaVal = updates.get("storageQuota");
                if (quotaVal instanceof Number) {
                    user.setStorageQuota(((Number) quotaVal).longValue());
                } else {
                    user.setStorageQuota(Long.parseLong(quotaVal.toString()));
                }
            }

            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<User> uploadAvatar(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        System.out.println("DEBUG: uploadAvatar called for user ID: " + id + ", file present: "
                + (file != null && !file.isEmpty()));
        try {
            return ResponseEntity.ok(userService.uploadProfilePicture(id, file));
        } catch (Exception e) {
            e.printStackTrace(); // Log detailed error to console/log
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        try {
            String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getName();

            User user = userRepository.findByUsername(username)
                    .orElseGet(() -> userRepository.findByEmail(username)
                            .orElse(null));

            if (user == null) {
                return ResponseEntity.status(404).build();
            }

            Map<String, Object> response = new java.util.HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("fullName", user.getFullName());
            response.put("profilePictureUrl", user.getProfilePictureUrl());

            if (user.getRole() != null) {
                Map<String, Object> roleMap = new java.util.HashMap<>();
                roleMap.put("name", user.getRole().getName());
                roleMap.put("description", user.getRole().getDescription());
                roleMap.put("permissions", user.getRole().getPermissions());
                response.put("role", roleMap);
            }

            return ResponseEntity.ok(response);

        } catch (Throwable e) {
            e.printStackTrace(); // Prints to stderr by default
            Map<String, Object> error = new java.util.HashMap<>();
            error.put("error", e.getClass().getName());
            error.put("message", e.getMessage());
            if (e.getStackTrace().length > 0) {
                error.put("trace", e.getStackTrace()[0].toString());
            }
            return ResponseEntity.status(500).body(error);
        }
    }

    // --- GDPR EXPORT ---
    @GetMapping("/me/export")
    public ResponseEntity<Map<String, Object>> exportMyData() {
        try {
            // Hämta inloggad användare
            String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getName();
            // Hitta ID via service eller repo (vi antar här att vi måste slå upp via
            // username eller att vi har ID i token)
            // För enkelhetens skull, låt oss anta att vi måste slå upp användaren via
            // username i UserService om vi inte har en metod för det.
            // Men UserService har ingen getByUsername. Vi kan fuska och iterera eller lägga
            // till metoden.
            // BÄTTRE: Lägg till findByUsername i Repository och Service.
            // MEN FÖR NU: Vi itererar findAll() (inte optimalt men funkar) eller ännu
            // hellre:
            // Vi hämtar User via ID om vi kan extrahera det från Principal, men Principal
            // är ofta bara username sträng.

            // Lösning: Låt oss använda en befintlig metod eller lägga till en snabb lookup
            // userRepo.findByUsername(username) -- Vi har inte det i repot än.

            // Alternativ: Loopa igenom getAllUsers()... Nej.
            // Vi lägger till findByUsername i UserRepository snabbt, eller fuskar.
            // Vi fuskar INTE. Vi använder getAllUsers().stream()...

            User user = userService.getAllUsers().stream()
                    .filter(u -> u.getUsername().equals(username))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(userService.exportUserData(user.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // --- ACTIVITY ---
    @PostMapping("/ping")
    public ResponseEntity<Void> ping() {
        try {
            String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseGet(() -> userRepository.findByEmail(username).orElse(null));

            if (user != null) {
                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                java.time.LocalDateTime lastActive = user.getLastActive();

                if (lastActive != null) {
                    long minutesDiff = java.time.Duration.between(lastActive, now).toMinutes();
                    // Only count if diff is reasonable (less than 15 mins) to avoid counting sleep
                    // time
                    if (minutesDiff < 15 && minutesDiff > 0) {
                        long currentMinutes = user.getActiveMinutes() != null ? user.getActiveMinutes() : 0L;
                        user.setActiveMinutes(currentMinutes + minutesDiff);
                    }
                }

                user.setLastActive(now);
                userRepository.save(user);
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}