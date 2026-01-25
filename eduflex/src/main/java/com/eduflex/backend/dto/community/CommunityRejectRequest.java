package com.eduflex.backend.dto.community;

/**
 * Request DTO for admin rejecting a community item
 */
public record CommunityRejectRequest(
        String reason
) {}
