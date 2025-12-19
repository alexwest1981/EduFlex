package com.eduflex.backend.dto;

public record JwtResponse(
        String token,
        Long id,
        String username,
        String fullName,
        String role
) {}