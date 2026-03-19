package com.eduflex.backend.dto;

import java.util.List;

public record RecommendationRequestDTO(
    List<String> missingSkills
) {}
