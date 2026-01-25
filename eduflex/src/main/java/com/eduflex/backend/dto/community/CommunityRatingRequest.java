package com.eduflex.backend.dto.community;

/**
 * Request DTO for rating a community item
 */
public record CommunityRatingRequest(
        int rating,
        String comment
) {}
