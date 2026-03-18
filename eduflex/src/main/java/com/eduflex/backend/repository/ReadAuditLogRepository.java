package com.eduflex.backend.repository;

import com.eduflex.backend.model.ReadAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReadAuditLogRepository extends JpaRepository<ReadAuditLog, Long> {
    List<ReadAuditLog> findByTargetUserId(Long targetUserId);
    List<ReadAuditLog> findByActorId(Long actorId);
}
