package com.eduflex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoiDataPoint {
    private String studentName;
    private String studentEmail;
    private Integer masteryScore; // 0-100
    private String metricName;
    private Double metricValue;
    private String dateRecorded;
}
