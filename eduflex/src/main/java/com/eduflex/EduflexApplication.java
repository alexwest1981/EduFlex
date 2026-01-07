package com.eduflex.backend;

import com.eduflex.backend.model.User;
import com.eduflex.backend.model.User.Role;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class EduflexApplication {

    public static void main(String[] args) {
        SpringApplication.run(EduflexApplication.class, args);
    }

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                System.out.println("⚠️  ADMIN SAKNAS - SKAPAR KONTO...");
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin"));
                admin.setEmail("admin@eduflex.se");
                admin.setFirstName("Admin");
                admin.setLastName("User");
                admin.setRole(Role.ADMIN);
                admin.setActive(true);

                userRepository.save(admin);
                System.out.println("✅  ADMIN SKAPAD: admin / admin");
            } else {
                System.out.println("ℹ️  Admin-konto finns redan.");
            }
        };
    }
}