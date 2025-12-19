package com.eduflex.backend.dto;

import java.time.LocalDate;
import java.util.List;

public record CourseDTO(
        Long id,
        String name,
        String courseCode,
        String description,
        LocalDate startDate,
        UserSummaryDTO teacher,      // Vi använder vår säkra DTO här
        List<UserSummaryDTO> students // Och en lista av säkra DTOer här
) {}