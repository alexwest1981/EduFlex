package com.eduflex.backend.dto;

import java.time.LocalDateTime;

public record AssignmentDTO(
        Long id,
        String title,
        String description,
        LocalDateTime dueDate,
        Long courseId
) {}