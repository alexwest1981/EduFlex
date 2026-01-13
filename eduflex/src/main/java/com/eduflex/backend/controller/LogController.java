package com.eduflex.backend.controller;

import com.eduflex.backend.service.LogService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger("ClientLogger");
    private final LogService logService;

    public LogController(LogService logService) {
        this.logService = logService;
    }

    @GetMapping("/files")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public List<String> getLogFiles() {
        return logService.getAvailableLogFiles();
    }

    @GetMapping("/content")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public List<String> getLogContent(@RequestParam(defaultValue = "server.log") String filename,
            @RequestParam(defaultValue = "100") int lines) {
        try {
            return logService.getLogContent(filename, lines);
        } catch (IOException | SecurityException e) {
            return List.of("Error reading log file: " + e.getMessage());
        }
    }

    @PostMapping("/client")
    @PreAuthorize("isAuthenticated()")
    public void reportClientError(@RequestBody java.util.Map<String, Object> errorData) {
        String message = (String) errorData.get("message");
        String stack = (String) errorData.get("stack");
        String url = (String) errorData.get("url");
        String userAgent = (String) errorData.get("userAgent");

        // Log formatted error for easy parsing
        logger.error("[CLIENT-ERROR] Msg: '{}', URL: '{}', UserAgent: '{}'. Stack: {}",
                message, url, userAgent, stack);
    }
}
