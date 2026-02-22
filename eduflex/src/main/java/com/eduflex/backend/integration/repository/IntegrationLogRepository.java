package com.eduflex.backend.integration.repository;

import com.eduflex.backend.integration.model.IntegrationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface IntegrationLogRepository extends JpaRepository<IntegrationLog, UUID> {
}
