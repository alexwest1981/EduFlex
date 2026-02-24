package com.eduflex.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO för CSN-rapportering – innehåller närvaro, aktivitet och kursresultat per
 * elev.
 * Används av ReportController för export till CSV/Excel.
 */
@Data
@Builder
public class CsnAttendanceDto {
    private String studentName;
    private String ssn;
    private String courseName;
    private String courseCode;
    private int totalLessons;
    private int attendedLessons;
    private double attendancePercentage;

    // Aktivitetsdata – speciellt viktigt för CSN-rapportering
    private LocalDateTime lastLogin;
    private LocalDateTime lastActive;
    private Long activeMinutes;

    // Kursresultat – visar om eleven är godkänd
    private String courseResult; // PENDING, PASSED, FAILED
}
