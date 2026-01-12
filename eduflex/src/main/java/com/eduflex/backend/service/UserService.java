package com.eduflex.backend.service;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final com.eduflex.backend.repository.RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final LicenseService licenseService;

    private final com.eduflex.backend.repository.AuditLogRepository auditLogRepository;
    private final FileStorageService fileStorageService;

    public UserService(UserRepository userRepository,
            com.eduflex.backend.repository.RoleRepository roleRepository,
            PasswordEncoder passwordEncoder, LicenseService licenseService,
            com.eduflex.backend.repository.AuditLogRepository auditLogRepository,
            FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.licenseService = licenseService;
        this.auditLogRepository = auditLogRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("Användare hittades inte"));
    }

    public User registerUser(User user) {
        // --- LICENSE LIMIT CHECK ---
        int maxUsers = licenseService.getTier().getMaxUsers();
        if (maxUsers != -1 && userRepository.count() >= maxUsers) {
            throw new RuntimeException("Licensgräns uppnådd! Uppgradera din plan för att lägga till fler användare.");
        }
        // ---------------------------

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null) {
            com.eduflex.backend.model.Role studentRole = roleRepository.findByName("STUDENT")
                    .orElseThrow(() -> new RuntimeException("Default role STUDENT not found in database."));
            user.setRole(studentRole);
        }
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

        String roleName = user.getRole().getName();

        if ("ADMIN".equals(roleName) || user.getRole().isSuperAdmin()) {
            // Admin får se alla
            return userRepository.findAll();
        } else if ("TEACHER".equals(roleName)) {
            // 1. Sina egna elever (från kurser de skapat/undervisar i)
            // OBS: I modellen heter fältet 'coursesCreated' för lärare
            for (Course course : user.getCoursesCreated()) {
                contacts.addAll(course.getStudents());
            }

            // 2. Alla lärare
            contacts.addAll(userRepository.findByRole_Name("TEACHER"));

            // 3. Alla administratörer
            contacts.addAll(userRepository.findByRole_Name("ADMIN"));

        } else if ("STUDENT".equals(roleName)) {
            // 1. Loopa igenom studentens kurser
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
            String path = fileStorageService.storeFile(file);
            user.setProfilePictureUrl(path);
            return userRepository.save(user);
        }
        throw new RuntimeException("Ingen fil mottagen");
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    // --- GDPR EXPORT ---
    @Transactional(readOnly = true)
    public Map<String, Object> exportUserData(Long userId) {
        User user = getUserById(userId);
        Map<String, Object> data = new LinkedHashMap<>();

        // 1. Profil
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("fullName", user.getFullName());
        profile.put("email", user.getEmail());
        profile.put("ssn", user.getSsn());
        profile.put("role", user.getRole().getName());
        profile.put("points", user.getPoints());
        profile.put("level", user.getLevel());
        profile.put("createdAt", user.getCreatedAt());
        data.put("profile", profile);

        // 2. Kurser
        List<Map<String, Object>> courses = new ArrayList<>();
        for (Course c : user.getCourses()) {
            Map<String, Object> cm = new HashMap<>();
            cm.put("id", c.getId());
            cm.put("name", c.getName());
            cm.put("code", c.getCourseCode());
            cm.put("role", "STUDENT");
            courses.add(cm);
        }
        for (Course c : user.getCoursesCreated()) {
            Map<String, Object> cm = new HashMap<>();
            cm.put("id", c.getId());
            cm.put("name", c.getName());
            cm.put("code", c.getCourseCode());
            cm.put("role", "TEACHER");
            courses.add(cm);
        }
        data.put("courses", courses);

        // 3. Badges
        data.put("badges", user.getEarnedBadges());

        // 4. Audit Logs (Historik om vad jag gjort om userName matchar modifiedBy)
        // OBS: Detta kräver att vi har en AuditLogRepository eller att vi söker via
        // Example
        // Vi gör en enkel implementation som hämtar via matchande username
        // (Kan vara dyrt om tabellen är enorm, men OK för MVP)
        // För prestanda borde vi ha index på modified_by
        List<com.eduflex.backend.model.AuditLog> logs = auditLogRepository.findAll().stream()
                .filter(log -> log.getModifiedBy().equals(user.getUsername()))
                .limit(100)
                .collect(java.util.stream.Collectors.toList());
        data.put("activityLog", logs);

        return data;
    }
}