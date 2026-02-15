package com.eduflex.backend.service;

import com.eduflex.backend.model.AiAuditRecord;
import com.eduflex.backend.repository.AiAuditRecordRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiAuditService {

    private final AiAuditRecordRepository auditRecordRepository;
    private final ObjectMapper objectMapper;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveAiAuditLog(Long userId, String prompt, String jsonResponse) {
        try {
            AiAuditRecord auditLog = new AiAuditRecord();
            auditLog.setUserId(userId);
            auditLog.setActionType(AiAuditRecord.ActionType.ADAPTIVE_ANALYSIS);
            auditLog.setModelUsed("gemini-2.0-flash");
            auditLog.setInputContext(prompt.length() > 5000 ? prompt.substring(0, 5000) + "..." : prompt);
            auditLog.setOutputResult(jsonResponse);

            try {
                JsonNode rootNode = objectMapper.readTree(jsonResponse);
                if (rootNode.has("recommendations") && rootNode.get("recommendations").isArray()
                        && rootNode.get("recommendations").size() > 0) {
                    auditLog.setReasoningTrace(rootNode.get("recommendations").get(0)
                            .path("reasoningTrace").asText(null));
                }
            } catch (Exception ignored) {
                // Ignore JSON parsing errors for audit metadata
            }

            auditRecordRepository.save(auditLog);
            log.info("AI Audit Log saved successfully for user: {}", userId);
        } catch (Exception e) {
            log.error("CRITICAL: Failed to save AI Audit Log in NEW transaction. Error: {}", e.getMessage(), e);
            // We swallow the exception to ensure the main transaction is not affected,
            // relying on REQUIRES_NEW to isolate the rollback if it happened.
        }
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<AiAuditRecord> getAllAuditLogs(
            org.springframework.data.domain.Pageable pageable) {
        return auditRecordRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public java.util.List<AiAuditRecord> getAuditLogsByUser(Long userId) {
        return auditRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
