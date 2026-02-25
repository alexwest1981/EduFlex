package com.eduflex.backend.controller;

import com.eduflex.backend.dto.CsnAttendanceDto;
import com.eduflex.backend.model.AuditLog;
import com.eduflex.backend.model.GeneratedReport;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.AuditLogRepository;
import com.eduflex.backend.repository.GeneratedReportRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.CsnReportService;
import com.eduflex.backend.service.CsnXmlService;
import com.eduflex.backend.service.GdprAuditService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller för CSN-rapportering, GDPR-loggar och registerutdrag.
 * Alla export-operationer loggas automatiskt enligt GDPR.
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final CsnReportService csnReportService;
    private final CsnXmlService csnXmlService;
    private final GeneratedReportRepository generatedReportRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final GdprAuditService gdprAuditService;
    private final ObjectMapper objectMapper;

    /**
     * Generera CSN-rapport (JSON) för en enskild kurs.
     * Sparas automatiskt i rapportarkivet.
     */
    @GetMapping("/csn/attendance/{courseId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'PRINCIPAL', 'ROLE_PRINCIPAL', 'REKTOR', 'ROLE_REKTOR', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<List<CsnAttendanceDto>> getCsnAttendance(
            @PathVariable Long courseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        List<CsnAttendanceDto> report = csnReportService.generateCsnAttendanceReport(courseId, start, end);
        archiveJsonReport(report, start, end);
        return ResponseEntity.ok(report);
    }

    /**
     * Bulk-export: generera CSN-rapport för flera kurser i ett anrop.
     * Sparas automatiskt i rapportarkivet.
     */
    @PostMapping("/csn/attendance/bulk")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'PRINCIPAL', 'ROLE_PRINCIPAL', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<List<CsnAttendanceDto>> getBulkCsnAttendance(
            @RequestBody BulkCsnRequest request) {

        List<CsnAttendanceDto> report = csnReportService.generateBulkCsnReport(
                request.getCourseIds(), request.getStart(), request.getEnd());
        archiveJsonReport(report, request.getStart(), request.getEnd());
        return ResponseEntity.ok(report);
    }

    // --- Rapportarkiv ---

    /**
     * Lista alla arkiverade rapporter (utan JSON-data för snabb laddning).
     */
    @GetMapping("/archive")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'PRINCIPAL', 'ROLE_PRINCIPAL', 'REKTOR', 'ROLE_REKTOR', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<List<GeneratedReport>> getArchivedReports() {
        return ResponseEntity.ok(generatedReportRepository.findAllWithoutData());
    }

    /**
     * Hämta en arkiverad rapport med fullständig JSON-data.
     */
    @GetMapping("/archive/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'PRINCIPAL', 'ROLE_PRINCIPAL', 'REKTOR', 'ROLE_REKTOR', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<GeneratedReport> getArchivedReport(@PathVariable Long id) {
        return generatedReportRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Ta bort en arkiverad rapport.
     */
    @DeleteMapping("/archive/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'PRINCIPAL', 'ROLE_PRINCIPAL', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<Void> deleteArchivedReport(@PathVariable Long id) {
        if (!generatedReportRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        generatedReportRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Sparar en genererad JSON-rapport i arkivet.
     * Fel vid arkivering stoppar inte huvudsvaret.
     */
    private void archiveJsonReport(List<CsnAttendanceDto> report, LocalDateTime start, LocalDateTime end) {
        if (report == null || report.isEmpty()) return;
        try {
            String courseNames = report.stream()
                    .map(CsnAttendanceDto::getCourseName)
                    .distinct()
                    .collect(Collectors.joining(", "));
            long courseCount = report.stream().map(CsnAttendanceDto::getCourseName).distinct().count();

            String title = courseCount == 1
                    ? "CSN Rapport — " + courseNames
                    : String.format("CSN Rapport — %d kurser (%s...)", courseCount,
                            courseNames.length() > 40 ? courseNames.substring(0, 40) : courseNames);

            DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

            GeneratedReport saved = GeneratedReport.builder()
                    .title(title)
                    .reportType("CSN")
                    .format("JSON")
                    .periodStart(start != null ? start.format(dateFmt) : null)
                    .periodEnd(end != null ? end.format(dateFmt) : null)
                    .rowCount(report.size())
                    .generatedBy(getCurrentUsername())
                    .createdAt(LocalDateTime.now())
                    .dataJson(objectMapper.writeValueAsString(report))
                    .build();

            generatedReportRepository.save(saved);
        } catch (Exception e) {
            log.warn("Kunde inte arkivera rapport: {}", e.getMessage());
        }
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : "system";
    }

    /**
     * Excel-export: generera CSN-rapport som .xlsx-fil.
     * Returnerar en nedladdningsbar fil med alla kolumner.
     */
    @GetMapping("/csn/attendance/{courseId}/excel")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'PRINCIPAL', 'ROLE_PRINCIPAL', 'REKTOR', 'ROLE_REKTOR', 'TEACHER', 'ROLE_TEACHER')")
    public ResponseEntity<byte[]> getCsnAttendanceExcel(
            @PathVariable Long courseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) throws Exception {

        List<CsnAttendanceDto> data = csnReportService.generateCsnAttendanceReport(courseId, start, end);
        byte[] excelBytes = generateExcel(data);

        String filename = String.format("CSN_Rapport_%s.xlsx",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    /**
     * XML-export: generera CSN-rapport som .xml-fil.
     * Stöder alla utbildningstyper: KOMVUX, YH och HOGSKOLA.
     * Bulk-stöd – kan inkludera flera kurser i ett anrop.
     */
    @PostMapping("/csn/xml")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'PRINCIPAL', 'ROLE_PRINCIPAL', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<byte[]> generateCsnXml(@RequestBody CsnXmlRequest request) throws Exception {
        byte[] xml = csnXmlService.generateXml(
                request.getCourseIds(),
                request.getEducationType(),
                request.getNiva(),
                request.getStudieomfattning());

        String filename = String.format("CSN_Rapport_%s_%s.xml",
                request.getEducationType() != null ? request.getEducationType() : "KOMVUX",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_XML)
                .body(xml);
    }

    /**
     * GDPR Audit Loggar – visar alla GDPR-relaterade loggar.
     * Bara admin har åtkomst.
     */
    @GetMapping("/gdpr/audit-logs")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<List<AuditLog>> getGdprAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findByActionStartingWithOrderByTimestampDesc("GDPR_"));
    }

    /**
     * GDPR Registerutdrag (Art. 15): all sparad data om en specifik elev.
     * Loggas automatiskt som GDPR PII-åtkomst.
     */
    @GetMapping("/gdpr/student/{studentId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'PRINCIPAL', 'ROLE_PRINCIPAL', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<Map<String, Object>> getGdprStudentDataExtract(@PathVariable Long studentId) {
        Optional<User> userOpt = userRepository.findById(studentId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User student = userOpt.get();

        // Bygg registerutdraget – all personlig data vi lagrar om eleven
        Map<String, Object> extract = new HashMap<>();
        extract.put("id", student.getId());
        extract.put("firstName", student.getFirstName());
        extract.put("lastName", student.getLastName());
        extract.put("email", student.getEmail());
        extract.put("username", student.getUsername());
        extract.put("ssn", student.getSsn());
        extract.put("phone", student.getPhone());
        extract.put("address", student.getAddress());
        extract.put("language", student.getLanguage());
        extract.put("createdAt", student.getCreatedAt());
        extract.put("lastLogin", student.getLastLogin());
        extract.put("lastActive", student.getLastActive());
        extract.put("activeMinutes", student.getActiveMinutes());
        extract.put("loginCount", student.getLoginCount());
        extract.put("role", student.getRole() != null ? student.getRole().getName() : null);

        // Logga att vi lämnade ut personuppgifter (GDPR Art. 15)
        gdprAuditService.logPiiAccess("User", String.valueOf(studentId), "REGISTER_EXTRACT",
                "GDPR Art. 15 registerutdrag begärt");

        log.info("GDPR Art. 15: Registerutdrag genererat för student {}", studentId);
        return ResponseEntity.ok(extract);
    }

    /**
     * Genererar en Excel-fil (.xlsx) från CSN-data.
     * Snyggt formaterad med rubriker och autostorlek på kolumner.
     */
    private byte[] generateExcel(List<CsnAttendanceDto> data) throws Exception {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("CSN Rapport");

            // Rubrikstil – fet text med bakgrundsfärg
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Rubriker
            String[] headers = { "Elev", "Personnr (SSN)", "Kurs", "Kurskod", "Lektioner (Närv)",
                    "Lektioner (Totalt)", "Närvaro %", "Senaste Inloggning", "Senast Aktiv",
                    "Aktiva Minuter", "Kursresultat" };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Datarader
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            int rowNum = 1;
            for (CsnAttendanceDto dto : data) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(dto.getStudentName());
                row.createCell(1).setCellValue(dto.getSsn() != null ? dto.getSsn() : "Saknas");
                row.createCell(2).setCellValue(dto.getCourseName());
                row.createCell(3).setCellValue(dto.getCourseCode() != null ? dto.getCourseCode() : "");
                row.createCell(4).setCellValue(dto.getAttendedLessons());
                row.createCell(5).setCellValue(dto.getTotalLessons());
                row.createCell(6).setCellValue(Math.round(dto.getAttendancePercentage() * 10.0) / 10.0);
                row.createCell(7).setCellValue(dto.getLastLogin() != null ? dto.getLastLogin().format(dtf) : "Aldrig");
                row.createCell(8)
                        .setCellValue(dto.getLastActive() != null ? dto.getLastActive().format(dtf) : "Aldrig");
                row.createCell(9).setCellValue(dto.getActiveMinutes() != null ? dto.getActiveMinutes() : 0);
                row.createCell(10).setCellValue(dto.getCourseResult());
            }

            // Auto-justera kolumnbredder
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * DTO för bulk CSN-request (JSON/Excel).
     */
    @lombok.Data
    public static class BulkCsnRequest {
        private List<Long> courseIds;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime start;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime end;
    }

    /**
     * DTO för CSN XML-export.
     * educationType: KOMVUX, YH eller HOGSKOLA
     * niva:          GY (gymnasial) eller GR (grundläggande) — endast Komvux
     * studieomfattning: 25/50/75/100 — studietakt i % — endast Komvux
     */
    @lombok.Data
    public static class CsnXmlRequest {
        private List<Long> courseIds;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime start;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime end;
        private String educationType;
        private String niva;
        private Integer studieomfattning;
    }
}
