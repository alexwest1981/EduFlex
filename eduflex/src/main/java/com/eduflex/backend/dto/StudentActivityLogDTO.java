package com.eduflex.backend.dto;

import java.time.LocalDateTime;

public record StudentActivityLogDTO(
        Long id,
        Long userId,
        String userName,
        String activityType,
        String details,
        LocalDateTime timestamp,
        String materialTitle) {
}
