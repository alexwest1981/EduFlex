package com.eduflex.backend.repository;

import com.eduflex.backend.model.GamificationConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GamificationConfigRepository extends JpaRepository<GamificationConfig, Long> {

    Optional<GamificationConfig> findByOrganizationId(Long organizationId);

    // For system-wide config (organizationId = null)
    Optional<GamificationConfig> findByOrganizationIdIsNull();
}
