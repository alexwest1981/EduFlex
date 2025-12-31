package com.eduflex.backend.service;

import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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
        // 1. Kryptera lösenord
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 2. Se till att roll är satt (default STUDENT)
        if (user.getRole() == null) {
            user.setRole(User.Role.STUDENT);
        }

        // 3. Sätt status till aktiv
        user.setActive(true);

        // OBS: Vi anropar INTE setFullName() här, eftersom namnet sätts via firstName/lastName direkt från frontend.

        return userRepository.save(user);
    }

    public List<String> generateUsernameSuggestions(String firstName, String lastName, String ssn) {
        List<String> suggestions = new ArrayList<>();

        // Rensa strängar från mellanslag och gör små bokstäver
        String f = firstName.toLowerCase().trim();
        String l = lastName.toLowerCase().trim();
        String s = ssn.length() >= 4 ? ssn.substring(ssn.length() - 4) : "0000";

        // Förslag 1: fornamn.efternamn (johan.andersson)
        suggestions.add(f + "." + l);

        // Förslag 2: f.efternamn (j.andersson)
        suggestions.add(f.charAt(0) + "." + l);

        // Förslag 3: fornamn + sista 4 i personnr (johan1234)
        suggestions.add(f + s);

        // Förslag 4: efternamn + fornamn (andersson.johan)
        suggestions.add(l + "." + f);

        // Filtrera bort upptagna användarnamn (enkel check)
        // I produktion bör du kolla mot databasen här:
        // return suggestions.stream().filter(u -> !userRepository.existsByUsername(u)).toList();

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
        // Alternativ: user.setActive(false); userRepository.save(user);
        userRepository.deleteById(id);
    }
}