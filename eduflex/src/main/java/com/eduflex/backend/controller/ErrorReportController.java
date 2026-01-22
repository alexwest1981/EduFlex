package com.eduflex.backend.controller;

import com.eduflex.backend.dto.ErrorReport;
import com.eduflex.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/errors")
public class ErrorReportController {

    @Autowired
    private MessageService messageService;

    @PostMapping("/report")
    public ResponseEntity<Map<String, String>> reportError(@RequestBody ErrorReport errorReport) {
        try {
            messageService.sendErrorReportToAdmins(errorReport);
            return ResponseEntity.ok(Map.of("message", "Error reported successfully"));
        } catch (Exception e) {
            // Don't fail if error reporting fails - log it instead
            System.err.println("Failed to send error report: " + e.getMessage());
            return ResponseEntity.ok(Map.of("message", "Error logged locally"));
        }
    }
}
