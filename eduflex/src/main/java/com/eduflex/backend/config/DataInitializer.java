package com.eduflex.backend.config;

import com.eduflex.backend.model.User; // Korrekt import enligt din fil
import com.eduflex.backend.model.User.Role; // Role ligger inuti User
import com.eduflex.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Kontrollera om admin redan finns
        if (userRepository.findByUsername("admin").isEmpty()) {
            System.out.println("⚠️ Ingen admin hittades. Skapar standardanvändare: admin / admin");

            User admin = new User(); // Ändrat från AppUser till User
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setEmail("admin@eduflex.se");
            admin.setFirstName("Admin");
            admin.setLastName("User");

            // Sätter rollen korrekt (Enum inuti User-klassen)
            admin.setRole(Role.ADMIN);

            userRepository.save(admin);
            System.out.println("✅ Admin-konto skapat!");
        }
    }
}