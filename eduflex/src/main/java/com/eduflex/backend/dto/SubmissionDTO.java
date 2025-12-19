package com.eduflex.backend.dto;

import java.time.LocalDateTime;

public record SubmissionDTO(
        Long id,
        Long assignmentId,
        Long studentId,
        String studentName, // Praktiskt för läraren att se direkt
        String fileName,
        String fileUrl,
        LocalDateTime submittedAt,
        String grade,       // "IG", "G", "VG"
        String feedback     // Kommentar från läraren
) {}