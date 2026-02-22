package com.eduflex.backend.integration.repository;

import com.eduflex.backend.integration.model.IntegrationConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IntegrationConfigRepository extends JpaRepository<IntegrationConfig, UUID> {
    Optional<IntegrationConfig> findByPlatform(String platform);
}
