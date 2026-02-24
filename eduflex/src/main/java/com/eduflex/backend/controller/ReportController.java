package com.eduflex.backend.controller;

import com.eduflex.backend.dto.CsnAttendanceDto;
import com.eduflex.backend.model.AuditLog;
import com.eduflex.backend.repository.AuditLogRepository;
import com.eduflex.backend.service.CsnReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final CsnReportService csnReportService;
    private final AuditLogRepository auditLogRepository;

    @GetMapping("/csn/attendance/{courseId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PRINCIPAL', 'ROLE_REKTOR', 'REKTOR')")
    public ResponseEntity<List<CsnAttendanceDto>> getCsnAttendance(
            @PathVariable Long courseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        return ResponseEntity.ok(csnReportService.generateCsnAttendanceReport(courseId, start, end));
    }

    @GetMapping("/gdpr/audit-logs")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<List<AuditLog>> getGdprAuditLogs() {
        // Return only GDPR related logs
        return ResponseEntity.ok(auditLogRepository.findByActionStartingWithOrderByTimestampDesc("GDPR_"));
    }
}
