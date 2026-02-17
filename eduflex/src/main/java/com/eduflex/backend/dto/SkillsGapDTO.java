package com.eduflex.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SkillsGapDTO {
    private List<SkillProgressDTO> skills;
    private String aiRecommendation;

    @Data
    @Builder
    public static class SkillProgressDTO {
        private String skillName;
        private String category;
        private Double currentLevel;
        private Double targetLevel;
        private Double gap;
    }
}
