package com.eduflex.backend.service;

import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // VIKTIG IMPORT
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Användare hittades inte"));
    }

    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null) {
            user.setRole(User.Role.STUDENT);
        }
        user.setActive(true);
        return userRepository.save(user);
    }

    // --- NY METOD: Hantera Gamification ---
    @Transactional
    public void addPoints(Long userId, int amount) {
        User user = getUserById(userId);

        int currentPoints = user.getPoints();
        int newPoints = currentPoints + amount;
        user.setPoints(newPoints);

        // Enkel logik: Ny level för varje 100 poäng
        // Ex: 150 poäng = Level 2 (1 + 1)
        int newLevel = 1 + (newPoints / 100);

        if (newLevel > user.getLevel()) {
            user.setLevel(newLevel);
            // Här kan man lägga till logik för "Badges" om man vill i framtiden
        }

        userRepository.save(user);
    }
    // -------------------------------------

    public List<String> generateUsernameSuggestions(String firstName, String lastName, String ssn) {
        List<String> suggestions = new ArrayList<>();
        String f = firstName.toLowerCase().trim();
        String l = lastName.toLowerCase().trim();
        String s = ssn.length() >= 4 ? ssn.substring(ssn.length() - 4) : "0000";

        suggestions.add(f + "." + l);
        suggestions.add(f.charAt(0) + "." + l);
        suggestions.add(f + s);
        suggestions.add(l + "." + f);

        return suggestions;
    }

    public User uploadProfilePicture(Long userId, MultipartFile file) throws IOException {
        User user = getUserById(userId);

        if (file != null && !file.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + "/" + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());

            user.setProfilePictureUrl("/uploads/" + fileName);
            return userRepository.save(user);
        }

        throw new RuntimeException("Ingen fil mottagen");
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}