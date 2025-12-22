package com.eduflex.backend.dto;

import com.eduflex.backend.model.CourseEvaluation;
import java.util.List;

public record CourseDTO(
        Long id,
        String name,
        String courseCode,
        String description,
        String startDate,
        String endDate,
        String color, // <--- NYTT FÄLT HÄR
        UserSummaryDTO teacher,
        List<UserSummaryDTO> students,
        boolean isOpen,
        CourseEvaluation evaluation
) {}