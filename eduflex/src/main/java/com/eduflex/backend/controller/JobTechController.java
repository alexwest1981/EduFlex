package com.eduflex.backend.controller;

import com.eduflex.backend.service.JobTechIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/jobtech")
@RequiredArgsConstructor
@Slf4j
public class JobTechController {

    private final JobTechIntegrationService jobTechService;

    /**
     * Endpoint to fetch the current and forecasted market demand for a specific
     * profession (SSYK code).
     * Typically used by the Principal/Admin when creating or editing a YH course.
     * 
     * @param ssykCode Systematisk förteckning över yrken (e.g., "2512")
     * @param region   Länskod eller region (e.g., "01" för Stockholm)
     */
    @GetMapping("/demand")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<Map<String, Object>> getRegionalDemand(
            @RequestParam String ssykCode,
            @RequestParam(required = false, defaultValue = "00") String region) {

        log.info("Requesting JobTech market demand for SSYK: {} in region: {}", ssykCode, region);
        Map<String, Object> demand = jobTechService.getDemandForProfession(ssykCode, region);
        return ResponseEntity.ok(demand);
    }
}
