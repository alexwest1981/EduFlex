package com.eduflex.accessibility;

import lombok.Data;
import java.util.List;

@Data
public class AIScanResponse {
    private int score;
    private boolean compliant;
    private List<ScanIssue> issues;
    private String summary;

    @Data
    public static class ScanIssue {
        private String requirementId;
        private String severity; // CRITICAL, WARNING, INFO
        private String description;
        private String suggestion;
        private String context;
    }
}
