package com.eduflex.backend.service;

import com.eduflex.backend.model.Connection;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.ConnectionRepository;
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
    private final StorageService storageService;
    private final ConnectionRepository connectionRepository;
    private final AchievementService achievementService;

    public UserService(UserRepository userRepository,
            com.eduflex.backend.repository.RoleRepository roleRepository,
            PasswordEncoder passwordEncoder, LicenseService licenseService,
            com.eduflex.backend.repository.AuditLogRepository auditLogRepository,
            StorageService storageService,
            ConnectionRepository connectionRepository,
            AchievementService achievementService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.licenseService = licenseService;
        this.auditLogRepository = auditLogRepository;
        this.storageService = storageService;
        this.connectionRepository = connectionRepository;
        this.achievementService = achievementService;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> searchUsers(String query) {
        String q = query.toLowerCase();
        return userRepository.findAll().stream()
                .filter(this::isPublicProfile) // Only show public profiles
                .filter(u -> (u.getFullName() != null && u.getFullName().toLowerCase().contains(q)) ||
                        (u.getUsername() != null && u.getUsername().toLowerCase().contains(q)) ||
                        (u.getEmail() != null && u.getEmail().toLowerCase().contains(q)))
                .limit(20) // Limit results
                .collect(java.util.stream.Collectors.toList());
    }

    private boolean isPublicProfile(User user) {
        if (user.getSettings() == null || user.getSettings().isEmpty())
            return true; // Default public
        return !user.getSettings().contains("\"publicProfile\":false");
    }

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Transactional
    public User getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Användare hittades inte"));
        // Force initialization of lazy collection for Frontend Widgets
        if (user.getEarnedBadges() != null) {
            user.getEarnedBadges().size();
        }
        return user;
    }

    @Transactional
    public User getUserByUsernameWithBadges(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Användare hittades inte: " + username));
        // Force initialization of lazy collection
        if (user.getEarnedBadges() != null) {
            user.getEarnedBadges().size();
        }
        return user;
    }

    public java.util.Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
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
        // --- HIDDEN LICENSE TRAP ---
        if (licenseService != null && !licenseService.isValid()) {
            throw new RuntimeException(
                    "Kunde inte synkronisera användardata mot säkerhetsprotokollet (Error: 0xAUTH-L02).");
        }
        // ---------------------------

        userRepository.findById(userId).ifPresent(user -> {
            user.setLastLogin(LocalDateTime.now());
            user.setLoginCount(user.getLoginCount() + 1);
            userRepository.save(user);

            // Check for login-related achievements
            try {
                achievementService.checkAndUnlock(userId, "login_count", user.getLoginCount());
                achievementService.checkAndUnlock(userId, "login_hour", LocalDateTime.now().getHour());
            } catch (Exception e) {
                System.err.println("Failed to check achievements: " + e.getMessage());
            }
        });
    }

    // --- NY METOD: Hämta giltiga kontakter ---
    @Transactional
    public List<User> getContactsForUser(Long userId) {
        // Fallback backward compatibility
        Map<String, List<User>> categorized = getCategorizedContacts(userId);
        List<User> all = new ArrayList<>();
        all.addAll(categorized.getOrDefault("friends", Collections.emptyList()));
        all.addAll(categorized.getOrDefault("classmates", Collections.emptyList()));
        all.addAll(categorized.getOrDefault("administration", Collections.emptyList()));
        all.addAll(categorized.getOrDefault("others", Collections.emptyList()));
        // Deduplicate based on ID
        return all.stream().distinct().collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public Map<String, List<User>> getCategorizedContacts(Long userId) {
        User user = getUserById(userId);
        Map<String, List<User>> result = new HashMap<>();
        List<User> friends = new ArrayList<>();
        List<User> classmates = new ArrayList<>();
        List<User> admin = new ArrayList<>();
        List<User> others = new ArrayList<>(); // För superadmin etc

        // 1. FRIENDS (Connection Status ACCEPTED)
        List<Connection> connections = connectionRepository.findAcceptedConnections(user);
        for (Connection c : connections) {
            if (c.getRequester().getId().equals(userId))
                friends.add(c.getReceiver());
            else
                friends.add(c.getRequester());
        }

        String roleName = user.getRole().getName();

        if ("ADMIN".equals(roleName) || user.getRole().isSuperAdmin()) {
            // Admin ser alla som "others" (eller i administration om vi vill)
            // För enkelhetens skull, lägg alla i others förutom vänner
            List<User> all = userRepository.findAll();
            all.removeIf(u -> u.getId().equals(userId));
            others.addAll(all);
        } else {
            // Hämta via KURSER (för Klasskamrater och Lärare för studenter)
            Set<Course> activeCourses;
            if ("TEACHER".equals(roleName))
                activeCourses = user.getCoursesCreated();
            else
                activeCourses = user.getCourses(); // Students

            for (Course course : activeCourses) {
                // Teachers (Om jag är student -> teacher är admin/lärare)
                if (course.getTeacher() != null && !course.getTeacher().getId().equals(userId)) {
                    // För Teachers är detta redundant om vi hämtar alla lärare senare, men skadar
                    // inte
                    if (!"TEACHER".equals(roleName))
                        admin.add(course.getTeacher());
                }

                // Students -> Classmates
                for (User student : course.getStudents()) {
                    if (!student.getId().equals(userId)) {
                        classmates.add(student);
                    }
                }
            }

            // Hämta Administrativ personal (ADMIN, PRINCIPAL, MENTOR)
            // Oavsett om jag är Student eller Teacher, ska jag se dessa.
            // Teachers ska dessutom se alla andra Teachers.

            List<User> allStaff = userRepository.findAll().stream()
                    .filter(u -> {
                        String r = u.getRole().getName();
                        boolean isStaff = "ADMIN".equals(r) || "PRINCIPAL".equals(r) || "MENTOR".equals(r);
                        boolean isTeacher = "TEACHER".equals(r);

                        // Om jag är Teacher, vill jag se alla andra Teachers också
                        if ("TEACHER".equals(roleName) && isTeacher)
                            return true;

                        // Alla vill se chefer/mentorer
                        return isStaff;
                    })
                    .collect(java.util.stream.Collectors.toList());

            // Filtrera bort mig själv
            allStaff.removeIf(u -> u.getId().equals(userId));
            admin.addAll(allStaff);
        }

        // Remove duplicates within lists (Robust implementation using TreeSet with ID
        // comparator)
        result.put("friends", friends.stream()
                .filter(u -> u != null && u.getId() != null)
                .collect(java.util.stream.Collectors.collectingAndThen(
                        java.util.stream.Collectors.toCollection(
                                () -> new java.util.TreeSet<>(java.util.Comparator.comparing(User::getId))),
                        ArrayList::new)));

        result.put("classmates", classmates.stream()
                .filter(u -> u != null && u.getId() != null)
                .collect(java.util.stream.Collectors.collectingAndThen(
                        java.util.stream.Collectors.toCollection(
                                () -> new java.util.TreeSet<>(java.util.Comparator.comparing(User::getId))),
                        ArrayList::new)));

        result.put("administration", admin.stream()
                .filter(u -> u != null && u.getId() != null)
                .collect(java.util.stream.Collectors.collectingAndThen(
                        java.util.stream.Collectors.toCollection(
                                () -> new java.util.TreeSet<>(java.util.Comparator.comparing(User::getId))),
                        ArrayList::new)));

        result.put("others", others.stream()
                .filter(u -> u != null && u.getId() != null)
                .collect(java.util.stream.Collectors.collectingAndThen(
                        java.util.stream.Collectors.toCollection(
                                () -> new java.util.TreeSet<>(java.util.Comparator.comparing(User::getId))),
                        ArrayList::new)));

        return result;
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
            String storageId = storageService.save(file);
            user.setProfilePictureUrl("/api/storage/" + storageId);
            userRepository.save(user);

            // Trigger Achievement
            try {
                achievementService.checkAndUnlock(userId, "has_avatar", 1);
            } catch (Exception e) {
                // ignore
            }
            return user;
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