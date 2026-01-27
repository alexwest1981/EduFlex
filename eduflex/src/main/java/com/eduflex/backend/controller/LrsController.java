package com.eduflex.backend.controller;

import com.eduflex.backend.model.XApiStatement;
import com.eduflex.backend.repository.XApiStatementRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lrs")
@CrossOrigin(origins = "*")
@Tag(name = "LRS (xAPI)", description = "Lightweight Learning Record Store for xAPI compliance")
public class LrsController {

    private static final Logger logger = LoggerFactory.getLogger(LrsController.class);
    private final XApiStatementRepository statementRepository;

    public LrsController(XApiStatementRepository statementRepository) {
        this.statementRepository = statementRepository;
    }

    @PostMapping("/statements")
    @Operation(summary = "Receive xAPI Statements", description = "Ingests xAPI statements from content players or mobile apps.")
    public ResponseEntity<List<String>> receiveStatements(
            @RequestHeader(value = "X-Experience-API-Version", defaultValue = "1.0.3") String version,
            @RequestBody Object payload) {

        logger.info("Received xAPI Statement(s) (Version: {})", version);

        // Convert payload to string for storage
        String rawJson;
        try {
            rawJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(payload);
        } catch (Exception e) {
            rawJson = "Error serializing statement: " + e.getMessage();
        }

        XApiStatement statement = new XApiStatement(rawJson);
        statementRepository.save(statement);

        // xAPI expects a list of IDs of stored statements in response to a POST
        return ResponseEntity.ok()
                .header("X-Experience-API-Version", "1.0.3")
                .body(List.of(java.util.UUID.randomUUID().toString()));
    }

    @GetMapping("/statements")
    @Operation(summary = "Get Recent Statements", description = "List recently received xAPI statements.")
    public ResponseEntity<List<XApiStatement>> getRecentStatements() {
        return ResponseEntity.ok()
                .header("X-Experience-API-Version", "1.0.3")
                .body(statementRepository.findAll());
    }
}
