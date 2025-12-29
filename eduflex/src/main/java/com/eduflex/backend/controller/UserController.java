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

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository; // Behövs för direkt access vid update

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
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.getUserById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- UPPDATERAD METOD: Hanterar partiell uppdatering via Map ---
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return userRepository.findById(id).map(user -> {
            if (updates.containsKey("firstName")) user.setFirstName((String) updates.get("firstName"));
            if (updates.containsKey("lastName")) user.setLastName((String) updates.get("lastName"));
            if (updates.containsKey("email")) user.setEmail((String) updates.get("email"));
            if (updates.containsKey("phone")) user.setPhone((String) updates.get("phone"));
            if (updates.containsKey("address")) user.setAddress((String) updates.get("address"));
            if (updates.containsKey("language")) user.setLanguage((String) updates.get("language"));

            // Uppdatera visningsnamn om för/efternamn ändrats
            if (updates.containsKey("firstName") || updates.containsKey("lastName")) {
                user.updateFullName();
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
}