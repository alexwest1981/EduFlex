package com.eduflex.backend.dto;

import java.time.LocalDate;

public record CreateCourseDTO(
        String name,
        String courseCode,
        String description,
        LocalDate startDate
) {}