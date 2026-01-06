package com.eduflex.backend.service;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("Användare hittades inte"));
    }

    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null) user.setRole(User.Role.STUDENT);
        user.setActive(true);
        return userRepository.save(user);
    }

    public void updateLastLogin(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLastLogin(LocalDateTime.now());
            user.setLoginCount(user.getLoginCount() + 1);
            userRepository.save(user);
        });
    }

    // --- NY METOD: Hämta giltiga kontakter ---
    @Transactional
    public List<User> getContactsForUser(Long userId) {
        User user = getUserById(userId);
        Set<User> contacts = new HashSet<>();

        if (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.TEACHER) {
            // Admin och Lärare får se alla (eller begränsa lärare om du vill)
            return userRepository.findAll();
        }

        if (user.getRole() == User.Role.STUDENT) {
            // 1. Lägg till Administratörer
            List<User> admins = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.Role.ADMIN)
                    .collect(Collectors.toList());
            contacts.addAll(admins);

            // 2. Loopa igenom studentens kurser
            for (Course course : user.getCourses()) {
                // Lägg till läraren
                if (course.getTeacher() != null) {
                    contacts.add(course.getTeacher());
                }
                // Lägg till klasskamrater
                contacts.addAll(course.getStudents());
            }
        }

        // Ta bort mig själv från listan
        contacts.removeIf(u -> u.getId().equals(userId));

        return new ArrayList<>(contacts);
    }
    // -----------------------------------------

    @Transactional
    public void addPoints(Long userId, int amount) {
        User user = getUserById(userId);
        int currentPoints = user.getPoints();
        int newPoints = currentPoints + amount;
        user.setPoints(newPoints);
        int newLevel = 1 + (newPoints / 100);
        if (newLevel > user.getLevel()) {
            user.setLevel(newLevel);
        }
        userRepository.save(user);
    }

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