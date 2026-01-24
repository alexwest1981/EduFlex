package com.eduflex.backend.service;

import com.eduflex.backend.model.Role;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.RoleRepository;
import com.eduflex.backend.repository.UserRepository;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CsvImportService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public CsvImportService(UserRepository userRepository, RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public ImportResult importUsers(MultipartFile file) {
        ImportResult result = new ImportResult();

        try (Reader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            CsvToBean<UserCsvDto> csvToBean = new CsvToBeanBuilder<UserCsvDto>(reader)
                    .withType(UserCsvDto.class)
                    .withIgnoreLeadingWhiteSpace(true)
                    .build();

            List<UserCsvDto> csvUsers = csvToBean.parse();

            for (UserCsvDto csvUser : csvUsers) {
                try {
                    if (userRepository.findByUsername(csvUser.getUsername()).isPresent()) {
                        result.addError("Username " + csvUser.getUsername() + " already exists.");
                        continue;
                    }
                    if (userRepository.findByEmail(csvUser.getEmail()).isPresent()) {
                        result.addError("Email " + csvUser.getEmail() + " already exists.");
                        continue;
                    }

                    User user = new User();
                    user.setUsername(csvUser.getUsername());
                    user.setEmail(csvUser.getEmail());
                    user.setFirstName(csvUser.getFirstName());
                    user.setLastName(csvUser.getLastName());

                    // Set default password if not provided (safe default: changeMe123!)
                    String rawPassword = csvUser.getPassword() != null && !csvUser.getPassword().isBlank()
                            ? csvUser.getPassword()
                            : "changeMe123!";
                    user.setPassword(passwordEncoder.encode(rawPassword));

                    // Resolve Role
                    String roleName = csvUser.getRole() != null ? csvUser.getRole().toUpperCase() : "STUDENT";
                    Optional<Role> roleOpt = roleRepository.findByName(roleName);
                    if (roleOpt.isEmpty()) {
                        roleOpt = roleRepository.findByName("ROLE_" + roleName);
                    }

                    if (roleOpt.isPresent()) {
                        user.setRole(roleOpt.get());
                    } else {
                        // Fallback to student if role invalid? Or error?
                        // Let's error for safety in bulk import
                        result.addError("Role " + roleName + " not found for user " + csvUser.getUsername());
                        continue;
                    }

                    userRepository.save(user);
                    result.incrementSuccess();

                } catch (Exception e) {
                    result.addError("Error processing user " + csvUser.getUsername() + ": " + e.getMessage());
                }
            }

        } catch (Exception e) {
            result.addError("Fatal error processing CSV file: " + e.getMessage());
        }

        return result;
    }

    // Helper classes
    public static class ImportResult {
        private int successCount = 0;
        private List<String> errors = new ArrayList<>();

        public void incrementSuccess() {
            successCount++;
        }

        public void addError(String error) {
            errors.add(error);
        }

        public int getSuccessCount() {
            return successCount;
        }

        public List<String> getErrors() {
            return errors;
        }
    }
}
