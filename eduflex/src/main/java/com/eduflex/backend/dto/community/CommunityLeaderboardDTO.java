package com.eduflex.backend.dto.community;

/**
 * DTO for the community contributor leaderboard
 */
public record CommunityLeaderboardDTO(
        Long userId,
        String name,
        String tenantName,
        String profilePictureUrl,
        int resourceCount,
        int downloadCount,
        double averageRating,
        int score // Calculated metric for ranking
) {
}
