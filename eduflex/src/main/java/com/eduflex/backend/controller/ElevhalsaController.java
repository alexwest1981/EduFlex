package com.eduflex.backend.controller;

import com.eduflex.backend.model.ElevhalsaCase;
import com.eduflex.backend.service.ElevhalsaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/elevhalsa")
public class ElevhalsaController {

    @Autowired
    private ElevhalsaService elevhalsaService;

    @GetMapping("/metrics")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        return ResponseEntity.ok(elevhalsaService.getMetrics());
    }

    @GetMapping("/risks")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<List<Map<String, Object>>> getRisks() {
        return ResponseEntity.ok(elevhalsaService.getAtRiskStudents());
    }

    @GetMapping("/cases")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<List<ElevhalsaCase>> getCases() {
        return ResponseEntity.ok(elevhalsaService.getAllCases());
    }

    @PostMapping("/cases")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
    public ResponseEntity<ElevhalsaCase> createCase(@RequestBody ElevhalsaCase healthCase) {
        return ResponseEntity.ok(elevhalsaService.createCase(healthCase));
    }
}
