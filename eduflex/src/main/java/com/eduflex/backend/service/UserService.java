package com.eduflex.backend.service;

import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Användarnamnet är upptaget!");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Sätt fullständigt namn om det inte redan är satt
        if (user.getFullName() == null || user.getFullName().isEmpty()) {
            user.setFullName(user.getFirstName() + " " + user.getLastName());
        }

        return userRepository.save(user);
    }

    // --- NY LOGIK: Generera användarnamn ---
    public List<String> generateUsernameSuggestions(String firstName, String lastName, String ssn) {
        List<String> suggestions = new ArrayList<>();

        if (firstName == null || lastName == null || ssn == null) return suggestions;

        // Rensa mellanslag och gör gemener
        String cleanFirst = firstName.trim().toLowerCase().replaceAll("\\s+", "");
        String cleanLast = lastName.trim().toLowerCase().replaceAll("\\s+", "");

        // Hämta år från personnummer (försök hantera 1990... och 90...)
        String year = "00";
        if (ssn.length() >= 2) {
            if (ssn.startsWith("19") || ssn.startsWith("20")) {
                year = ssn.substring(2, 4); // 1990 -> 90
            } else {
                year = ssn.substring(0, 2); // 90 -> 90
            }
        }

        String baseName = cleanFirst + cleanLast + year;

        // Alternativ 1: Bara namnet (t.ex. annaandersson90)
        if (!userRepository.existsByUsername(baseName)) {
            suggestions.add(baseName);
        }

        // Alternativ 2 & 3: Lägg till slumpmässiga siffror om det behövs
        Random random = new Random();
        int attempts = 0;
        while (suggestions.size() < 3 && attempts < 20) {
            String candidate = baseName + "_" + (random.nextInt(90) + 10); // t.ex. _23
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

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}