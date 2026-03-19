package com.eduflex.backend.dto;

import java.util.List;

public record CourseRecommendationDTO(
    CourseDTO course,
    Double relevanceScore,
    List<String> matchedSkills
) {}
