package com.eduflex.backend.service;

import com.eduflex.backend.model.AiAuditLog;
import com.eduflex.backend.repository.AiAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiAuditService {

    private final AiAuditLogRepository aiAuditLogRepository;

    @Async
    @Transactional
    public void logDecision(String actionType, String modelId, String actorId, String inputContext, String aiResponse,
            String reasoningTrace, boolean successful, String errorMessage) {
        try {
            AiAuditLog logEntry = new AiAuditLog();
            logEntry.setActionType(actionType);
            logEntry.setModelId(modelId);
            logEntry.setActorId(actorId);

            // Truncate if necessary to avoid DB errors, though TEXT type handles large
            // strings
            logEntry.setInputContext(inputContext);
            logEntry.setAiResponse(aiResponse);
            logEntry.setReasoningTrace(reasoningTrace);

            logEntry.setSuccessful(successful);
            logEntry.setErrorMessage(errorMessage);

            aiAuditLogRepository.save(logEntry);
            log.info("AI Decision logged: Action={}, Actor={}, Success={}", actionType, actorId, successful);
        } catch (Exception e) {
            log.error("Failed to log AI decision asynchronously", e);
        }
    }

    public List<AiAuditLog> getLogsByActor(String actorId) {
        return aiAuditLogRepository.findByActorIdOrderByTimestampDesc(actorId);
    }

    public List<AiAuditLog> getAllLogs() {
        return aiAuditLogRepository.findAllByOrderByTimestampDesc();
    }
}
