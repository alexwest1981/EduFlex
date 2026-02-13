package com.eduflex.backend.controller.quality;

import com.eduflex.backend.model.quality.ManagementReport;
import com.eduflex.backend.service.quality.ManagementReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ManagementReportController {

    private final ManagementReportService reportService;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<ManagementReport> generate(@RequestBody Map<String, String> request) {
        String title = request.getOrDefault("title", "Ledningsrapport " + request.get("period"));
        String period = request.get("period");
        Long authorId = Long.parseLong(request.get("authorId"));

        return ResponseEntity.ok(reportService.generateReport(title, period, authorId));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<List<ManagementReport>> getAll() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<ManagementReport> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReport(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<ManagementReport> updateStatus(@PathVariable Long id,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(reportService.updateReportStatus(id, request.get("status")));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reportService.deleteReport(id);
        return ResponseEntity.ok().build();
    }
}
