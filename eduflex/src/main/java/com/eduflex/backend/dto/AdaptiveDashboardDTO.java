package com.eduflex.backend.dto;

import com.eduflex.backend.model.AdaptiveLearningProfile;
import com.eduflex.backend.model.AdaptiveRecommendation;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdaptiveDashboardDTO {
    private AdaptiveLearningProfile profile;
    private List<AdaptiveRecommendation> recommendations;
}
