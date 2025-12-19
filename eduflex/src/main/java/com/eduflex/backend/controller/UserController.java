package com.eduflex.backend.controller;

import com.eduflex.backend.model.User;
import com.eduflex.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
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

    // --- NY ENDPOINT ---
    @PostMapping("/generate-usernames")
    public ResponseEntity<List<String>> generateUsernames(@RequestBody Map<String, String> payload) {
        String firstName = payload.get("firstName");
        String lastName = payload.get("lastName");
        String ssn = payload.get("ssn");

        if (firstName == null || lastName == null || ssn == null) {
            return ResponseEntity.badRequest().build();
        }

        List<String> suggestions = userService.generateUsernameSuggestions(firstName, lastName, ssn);
        return ResponseEntity.ok(suggestions);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
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