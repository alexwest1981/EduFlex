package com.eduflex.backend.dto;

import com.eduflex.backend.model.CourseEvaluation;
import java.time.LocalDate;
import java.util.List;

public record CourseDTO(
        Long id,
        String name,
        String courseCode,
        String description,
        LocalDate startDate,
        LocalDate endDate, // Nytt
        UserSummaryDTO teacher,
        List<UserSummaryDTO> students,
        boolean isOpen,
        CourseEvaluation evaluation
) {}