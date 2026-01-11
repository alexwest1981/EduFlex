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

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @Autowired
    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        try {
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

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.getUserById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
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
                user.setRole(User.Role.valueOf((String) updates.get("role")));
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

            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<User> uploadAvatar(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(userService.uploadProfilePicture(id, file));
        } catch (Exception e) {
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
}