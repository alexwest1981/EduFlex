package com.eduflex.backend.repository;

import com.eduflex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Data genererar SQL automatiskt baserat på namnet:
    // "SELECT * FROM app_users WHERE username = ?"
    Optional<User> findByUsername(String username);

    // Kolla om en användare finns (används vid registrering)
    boolean existsByUsername(String username);
}
