package com.eduflex.backend.controller;

import com.eduflex.backend.dto.RoiDataPoint;
import com.eduflex.backend.model.BusinessOutcome;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.BusinessOutcomeRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.ExportService;
import com.eduflex.backend.service.RoiService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roi")
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'REKTOR', 'PRINCIPAL')")
public class RoiController {

    private final RoiService roiService;
    private final ExportService exportService;
    private final BusinessOutcomeRepository businessOutcomeRepository;
    private final UserRepository userRepository;

    public RoiController(RoiService roiService, ExportService exportService,
            BusinessOutcomeRepository businessOutcomeRepository,
            UserRepository userRepository) {
        this.roiService = roiService;
        this.exportService = exportService;
        this.businessOutcomeRepository = businessOutcomeRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats/{courseId}")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long courseId) {
        return ResponseEntity.ok(roiService.calculateRoiStats(courseId));
    }

    @GetMapping("/data/{courseId}")
    public ResponseEntity<List<RoiDataPoint>> getData(@PathVariable Long courseId) {
        return ResponseEntity.ok(roiService.getRoiDataPoints(courseId));
    }

    @GetMapping("/insight/{courseId}")
    public ResponseEntity<Map<String, String>> getInsight(@PathVariable Long courseId) {
        return ResponseEntity.ok(Map.of("insight", roiService.getRoiAiInsight(courseId)));
    }

    @PostMapping("/outcomes")
    public ResponseEntity<BusinessOutcome> saveOutcome(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        Long courseId = payload.get("courseId") != null ? Long.valueOf(payload.get("courseId").toString()) : null;
        String metricName = payload.get("metricName").toString();
        Double metricValue = Double.valueOf(payload.get("metricValue").toString());

        User user = userRepository.findById(userId).orElseThrow();

        BusinessOutcome outcome = BusinessOutcome.builder()
                .user(user)
                .courseId(courseId)
                .metricName(metricName)
                .metricValue(metricValue)
                .recordedAt(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(businessOutcomeRepository.save(outcome));
    }

    @GetMapping("/export/{courseId}")
    public ResponseEntity<byte[]> export(@PathVariable Long courseId, @RequestParam String format) throws Exception {
        List<RoiDataPoint> data = roiService.getRoiDataPoints(courseId);
        byte[] content;
        String filename = "ROI_Report_Course_" + courseId;
        String contentType;

        switch (format.toLowerCase()) {
            case "csv":
                content = exportService.exportToCsv(data);
                contentType = "text/csv";
                filename += ".csv";
                break;
            case "xml":
                content = exportService.exportToXml(data);
                contentType = "application/xml";
                filename += ".xml";
                break;
            case "xlsx":
            case "excel":
                content = exportService.exportToExcel(data);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                filename += ".xlsx";
                break;
            case "json":
            default:
                content = exportService.exportToJson(data);
                contentType = "application/json";
                filename += ".json";
                break;
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType(contentType))
                .body(content);
    }
}
