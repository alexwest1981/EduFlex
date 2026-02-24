package com.eduflex.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CsnAttendanceDto {
    private String studentName;
    private String ssn;
    private String courseName;
    private int totalLessons;
    private int attendedLessons;
    private double attendancePercentage;
}
