package com.eduflex.backend.dto;

import java.time.LocalDate;

public record CreateCourseDTO(
        String name,
        String courseCode,
        String category,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        Long teacherId,
        String color,
        Integer maxStudents // <--- NYTT FÄLT
) {}