package com.eduflex.backend.service;

import com.eduflex.backend.model.AuditLog;
import com.eduflex.backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service for specialized GDPR audit logging.
 * This tracks access to PII (Personally Identifiable Information)
 * that is not already covered by standard entity mutation auditing.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GdprAuditService {

    private final AuditLogRepository auditLogRepository;

    public void logPiiAccess(String entityName, String entityId, String accessType, String reason) {
        String actor = getCurrentUsername();

        AuditLog auditLog = new AuditLog();
        auditLog.setAction("GDPR_ACCESS_" + accessType.toUpperCase());
        auditLog.setEntityName(entityName);
        auditLog.setEntityId(entityId);
        auditLog.setModifiedBy(actor);
        auditLog.setTimestamp(LocalDateTime.now());
        auditLog.setChangeData(String.format("{\"reason\": \"%s\", \"accessType\": \"%s\"}", reason, accessType));

        auditLogRepository.save(auditLog);
        log.info("GDPR Audit: PII Access logged for entity {} #{} by {} - Type: {}", entityName, entityId, actor,
                accessType);
    }

    public void logBulkExport(String reportName, String filterCriteria) {
        String actor = getCurrentUsername();

        AuditLog auditLog = new AuditLog();
        auditLog.setAction("GDPR_BULK_EXPORT");
        auditLog.setEntityName("Report");
        auditLog.setEntityId(reportName);
        auditLog.setModifiedBy(actor);
        auditLog.setTimestamp(LocalDateTime.now());
        auditLog.setChangeData(
                String.format("{\"reportName\": \"%s\", \"filters\": \"%s\"}", reportName, filterCriteria));

        auditLogRepository.save(auditLog);
        log.info("GDPR Audit: Bulk PII Export logged: {} by {}", reportName, actor);
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : "SYSTEM";
    }
}
