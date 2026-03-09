package com.eduflex.backend.service;

import com.eduflex.backend.model.ReadAuditLog;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.ReadAuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SecurityAuditService {

    private final ReadAuditLogRepository readAuditLogRepository;

    public SecurityAuditService(ReadAuditLogRepository readAuditLogRepository) {
        this.readAuditLogRepository = readAuditLogRepository;
    }

    public void logReadAccess(User actor, User targetUser, String resourceAccessed, String ipAddress, String userAgent) {
        ReadAuditLog log = new ReadAuditLog(actor, targetUser, resourceAccessed, ipAddress, userAgent);
        readAuditLogRepository.save(log);
    }
}
