package com.eduflex.backend.controller;

import com.eduflex.backend.model.XApiStatement;
import com.eduflex.backend.service.XApiProgressService;
import com.eduflex.backend.repository.XApiStatementRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Internal API for Receiving Progress Callbacks from eduflex-scorm
 * microservice.
 */
@RestController
@RequestMapping("/api/internal")
public class InternalProgressController {

    private static final Logger logger = LoggerFactory.getLogger(InternalProgressController.class);
    private final XApiProgressService progressService;
    private final XApiStatementRepository statementRepository;

    public InternalProgressController(XApiProgressService progressService,
            XApiStatementRepository statementRepository) {
        this.progressService = progressService;
        this.statementRepository = statementRepository;
    }

    @PostMapping("/progress-update")
    public ResponseEntity<Void> receiveProgressUpdate(@RequestBody Map<String, Object> payload) {
        logger.info("Received internal progress update: {}", payload);

        try {
            XApiStatement statement = new XApiStatement();
            statement.setRawStatement((String) payload.get("rawStatement"));
            statement.setActorEmail((String) payload.get("actorEmail"));
            statement.setVerbId((String) payload.get("verbId"));
            statement.setObjectId((String) payload.get("objectId"));
            statement.setRegistration((String) payload.get("registration"));
            statement.setStoredAt(LocalDateTime.now());

            // Save to database for audit trail (consistent with monolith LRS behavior)
            XApiStatement saved = statementRepository.save(statement);

            // Trigger progress calculation logic
            progressService.processStatement(saved);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Failed to process internal progress update", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
