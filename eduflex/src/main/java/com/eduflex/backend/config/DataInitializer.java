package com.eduflex.backend.config;

import com.eduflex.backend.model.User; // Korrekt import enligt din fil
import com.eduflex.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

        private final UserRepository userRepository;
        private final com.eduflex.backend.repository.RoleRepository roleRepository;
        private final PasswordEncoder passwordEncoder;
        private final org.springframework.core.env.Environment environment;

        public DataInitializer(UserRepository userRepository,
                        com.eduflex.backend.repository.RoleRepository roleRepository,
                        PasswordEncoder passwordEncoder,
                        org.springframework.core.env.Environment environment) {
                this.userRepository = userRepository;
                this.roleRepository = roleRepository;
                this.passwordEncoder = passwordEncoder;
                this.environment = environment;
        }

        @Override
        public void run(String... args) throws Exception {
                if (java.util.Arrays.asList(environment.getActiveProfiles()).contains("test")) {
                        System.out.println("⏩ Skipping DataInitializer in test profile.");
                        return;
                }
                // 1. Seed Roles
                createRoleIfNotFound("ADMIN", "Super Administrator", "ADMIN", true, java.util.Set.of());

                createRoleIfNotFound("TEACHER", "Lärare", "TEACHER", false, java.util.Set.of(
                                com.eduflex.backend.model.Permission.COURSE_CREATE,
                                com.eduflex.backend.model.Permission.COURSE_EDIT,
                                com.eduflex.backend.model.Permission.GRADE_ASSIGN));

                createRoleIfNotFound("STUDENT", "Student", "STUDENT", false, java.util.Set.of(
                                com.eduflex.backend.model.Permission.VIEW_COURSES,
                                com.eduflex.backend.model.Permission.ACCESS_SHOP));

                createRoleIfNotFound("PRINCIPAL", "Rektor", "PRINCIPAL", false, java.util.Set.of(
                                com.eduflex.backend.model.Permission.VIEW_COURSES));

                createRoleIfNotFound("MENTOR", "Mentor", "MENTOR", false, java.util.Set.of(
                                com.eduflex.backend.model.Permission.VIEW_COURSES));

                createRoleIfNotFound("SYV", "Studie- och yrkesvägledare", "SYV", false, java.util.Set.of());

                createRoleIfNotFound("RESELLER", "Säljare / Butiksansvarig", "/admin/sales", false, java.util.Set.of(
                                com.eduflex.backend.model.Permission.VIEW_COURSES,
                                com.eduflex.backend.model.Permission.COURSE_EDIT,
                                com.eduflex.backend.model.Permission.ACCESS_SHOP));

                // 2. Check/Create Admin User
                if (userRepository.findByUsername("admin").isEmpty()) {
                        System.out.println("⚠️ Ingen admin hittades. Skapar standardanvändare: admin / admin");

                        User admin = new User();
                        admin.setUsername("admin");
                        admin.setPassword(passwordEncoder.encode("admin"));
                        admin.setEmail("admin@eduflex.se");
                        admin.setFirstName("Admin");
                        admin.setLastName("User");

                        // Fetch Role Entity
                        com.eduflex.backend.model.Role adminRole = roleRepository.findByName("ADMIN")
                                        .orElseThrow(() -> new RuntimeException("Error: Role ADMIN is not found."));
                        admin.setRole(adminRole);

                        userRepository.save(admin);
                        System.out.println("✅ Admin-konto skapat!");
                }
        }

        private void createRoleIfNotFound(String name, String description, String defaultDashboard,
                        boolean isSuperAdmin,
                        java.util.Set<com.eduflex.backend.model.Permission> permissions) {
                if (roleRepository.findByName(name).isEmpty()) {
                        com.eduflex.backend.model.Role role = new com.eduflex.backend.model.Role(name, description,
                                        defaultDashboard, isSuperAdmin);
                        role.setPermissions(permissions);
                        roleRepository.save(role);
                        System.out.println("✅ Skapade roll: " + name);
                }
        }
}