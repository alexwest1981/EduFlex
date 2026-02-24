package com.eduflex.backend.repository;

import com.eduflex.backend.model.IntegrationConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

/**
 * Repository för att hantera integrationskonfigurationer.
 */
@Repository
public interface IntegrationConfigRepository extends JpaRepository<IntegrationConfig, Long> {

    Optional<IntegrationConfig> findByIntegrationType(String integrationType);

    List<IntegrationConfig> findByEnabledTrue();

    List<IntegrationConfig> findAllByOrderByDisplayNameAsc();
}
