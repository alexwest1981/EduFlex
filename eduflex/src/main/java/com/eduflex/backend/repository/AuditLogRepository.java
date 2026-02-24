package com.eduflex.backend.repository;

import com.eduflex.backend.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByModifiedBy(String modifiedBy);

    List<AuditLog> findByAction(String action);

    List<AuditLog> findByEntityName(String entityName);

    List<AuditLog> findByActionStartingWithOrderByTimestampDesc(String prefix);

    List<AuditLog> findAllByOrderByTimestampDesc();
}
