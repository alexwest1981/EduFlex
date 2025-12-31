package com.eduflex.backend.dto;

import com.eduflex.backend.model.CourseEvaluation;
import java.util.List;

public record CourseDTO(
        Long id,
        String name,
        String courseCode,
        String category, // <--- DETTA FÄLT SAKNADES
        String description,
        String startDate,
        String endDate,
        String color,
        UserSummaryDTO teacher,
        List<UserSummaryDTO> students,
        boolean isOpen,
        CourseEvaluation evaluation
) {}