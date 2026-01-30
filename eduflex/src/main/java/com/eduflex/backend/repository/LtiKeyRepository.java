package com.eduflex.backend.repository;

import com.eduflex.backend.model.LtiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LtiKeyRepository extends JpaRepository<LtiKey, Long> {
    Optional<LtiKey> findFirstByOrderByCreatedAtDesc();
}
