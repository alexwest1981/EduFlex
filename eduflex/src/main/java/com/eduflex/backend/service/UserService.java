package com.eduflex.backend.service;

import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Path fileStorageLocation; // För profilbilder

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;

        // Skapa mapp för profilbilder
        this.fileStorageLocation = Paths.get("uploads/profiles").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Kunde inte skapa mapp för profilbilder.", ex);
        }
    }

    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Användarnamnet är upptaget!");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getFullName() == null || user.getFullName().isEmpty()) {
            user.setFullName(user.getFirstName() + " " + user.getLastName());
        }

        return userRepository.save(user);
    }

    // NY METOD: Uppdatera användaruppgifter (adress, tel, email)
    public User updateUser(Long id, User updatedInfo) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Användare hittades inte"));

        // Uppdatera endast tillåtna fält
        if (updatedInfo.getAddress() != null) user.setAddress(updatedInfo.getAddress());
        if (updatedInfo.getPhone() != null) user.setPhone(updatedInfo.getPhone());
        if (updatedInfo.getEmail() != null) user.setEmail(updatedInfo.getEmail());

        // Om man vill byta namn kan man lägga till det här, men det påverkar ofta ssn/username logik

        return userRepository.save(user);
    }

    // NY METOD: Ladda upp profilbild
    public User uploadProfilePicture(Long id, MultipartFile file) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Användare hittades inte"));

        String originalName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileName = id + "_" + UUID.randomUUID() + "_" + originalName; // Unikt namn

        try {
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Uppdatera URL i databasen
            user.setProfilePictureUrl("/uploads/profiles/" + fileName);
            return userRepository.save(user);
        } catch (IOException ex) {
            throw new RuntimeException("Kunde inte spara profilbild", ex);
        }
    }

    public List<String> generateUsernameSuggestions(String firstName, String lastName, String ssn) {
        List<String> suggestions = new ArrayList<>();
        if (firstName == null || lastName == null || ssn == null) return suggestions;

        String cleanFirst = firstName.trim().toLowerCase().replaceAll("\\s+", "");
        String cleanLast = lastName.trim().toLowerCase().replaceAll("\\s+", "");

        String year = "00";
        if (ssn.length() >= 2) {
            if (ssn.startsWith("19") || ssn.startsWith("20")) {
                year = ssn.substring(2, 4);
            } else {
                year = ssn.substring(0, 2);
            }
        }

        String baseName = cleanFirst + cleanLast + year;

        if (!userRepository.existsByUsername(baseName)) {
            suggestions.add(baseName);
        }

        Random random = new Random();
        int attempts = 0;
        while (suggestions.size() < 3 && attempts < 20) {
            String candidate = baseName + "_" + (random.nextInt(90) + 10);
            if (!userRepository.existsByUsername(candidate) && !suggestions.contains(candidate)) {
                suggestions.add(candidate);
            }
            attempts++;
        }
        return suggestions;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // Hämta en specifik användare (för profilsidan)
    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("Hittades inte"));
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}