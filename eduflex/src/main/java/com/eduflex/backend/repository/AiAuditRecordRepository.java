package com.eduflex.backend.repository;

import com.eduflex.backend.model.AiAuditRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiAuditRecordRepository extends JpaRepository<AiAuditRecord, Long> {
    List<AiAuditRecord> findByUserIdOrderByCreatedAtDesc(Long userId);
}
