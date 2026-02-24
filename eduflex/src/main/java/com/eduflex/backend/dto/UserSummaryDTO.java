package com.eduflex.backend.dto;

// En enkel "record" som bara bär data, ingen logik eller databaskoppling.
public record UserSummaryDTO(
        Long id,
        String firstName,
        String lastName,
        String fullName,
        String username,
        String role,
        String avatarUrl,
        java.time.LocalDateTime lastLogin,
        java.time.LocalDateTime lastActive,
        Long activeMinutes) {
}