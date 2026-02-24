package com.eduflex.backend.repository;

import com.eduflex.backend.model.AiAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiAuditLogRepository extends JpaRepository<AiAuditLog, UUID> {
    List<AiAuditLog> findByActorIdOrderByTimestampDesc(String actorId);

    List<AiAuditLog> findByActionTypeOrderByTimestampDesc(String actionType);

    List<AiAuditLog> findAllByOrderByTimestampDesc();
}
