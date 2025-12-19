package com.eduflex.backend.dto;

// En enkel "record" som bara bär data, ingen logik eller databaskoppling.
public record UserSummaryDTO(
        Long id,
        String fullName,
        String username,
        String role
) {}