package com.eduflex.backend.service;

import com.eduflex.backend.model.User;
import com.eduflex.backend.integration.repository.IntegrationConfigRepository;
import com.eduflex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Hanterar import av elever och klasser via CSV-filer.
 * Stödjer formatet: förnamn,efternamn,email,personnummer,roll
 * Validerar dubbletter och returnerar en importrapport.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SisImportService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final IntegrationConfigRepository configRepository;

    /**
     * Importerar elever från en CSV-fil.
     * Förväntat format: förnamn,efternamn,email,personnummer
     * Hoppar över rader med befintliga email-adresser (dubbletthantering).
     */
    public Map<String, Object> importStudentsFromCsv(MultipartFile file) {
        List<Map<String, String>> imported = new ArrayList<>();
        List<Map<String, String>> skipped = new ArrayList<>();
        List<Map<String, String>> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String header = reader.readLine(); // Skippa header-rad
            if (header == null) {
                return Map.of("status", "ERROR", "message", "Filen är tom");
            }

            String line;
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                try {
                    String[] parts = line.split(",");
                    if (parts.length < 4) {
                        errors.add(Map.of("line", String.valueOf(lineNumber), "reason", "För få kolumner"));
                        continue;
                    }

                    String firstName = parts[0].trim();
                    String lastName = parts[1].trim();
                    String email = parts[2].trim();
                    String ssn = parts[3].trim();

                    // Kolla om användaren redan finns
                    if (userRepository.findByEmail(email).isPresent()) {
                        skipped.add(Map.of("email", email, "reason", "Finns redan"));
                        continue;
                    }

                    // Skapa ny användare med standardlösenord
                    User newUser = new User();
                    newUser.setFirstName(firstName);
                    newUser.setLastName(lastName);
                    newUser.setEmail(email);
                    newUser.setUsername(email);
                    newUser.setSsn(ssn);
                    newUser.setPassword(passwordEncoder.encode("EduFlex2026!"));

                    userRepository.save(newUser);
                    imported.add(Map.of("email", email, "name", firstName + " " + lastName));

                } catch (Exception e) {
                    errors.add(Map.of("line", String.valueOf(lineNumber), "reason", e.getMessage()));
                }
            }

            // Uppdatera integrationsstatus
            updateSyncStatus(imported.size());

            log.info("📥 SIS Import klar: {} importerade, {} hoppades över, {} fel",
                    imported.size(), skipped.size(), errors.size());

        } catch (Exception e) {
            log.error("❌ SIS Import misslyckades: {}", e.getMessage());
            return Map.of("status", "ERROR", "message", "Import misslyckades: " + e.getMessage());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("imported", imported);
        result.put("importedCount", imported.size());
        result.put("skipped", skipped);
        result.put("skippedCount", skipped.size());
        result.put("errors", errors);
        result.put("errorCount", errors.size());
        return result;
    }

    private void updateSyncStatus(int count) {
        configRepository.findByPlatform("SIS").ifPresent(config -> {
            config.setLastSync(LocalDateTime.now());
            config.setStatus("CONNECTED");
            config.setActive(true);
            configRepository.save(config);
        });
    }
}
