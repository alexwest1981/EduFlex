package com.eduflex.backend.dto.community;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Detailed profile for a community author
 */
public record AuthorProfileDTO(
        Long userId,
        String name,
        String tenantName,
        String profilePictureUrl,
        String bio,
        String linkedinUrl,
        String twitterUrl,
        int totalResources,
        double averageRating,
        int totalDownloads,
        LocalDateTime memberSince,
        List<CommunityItemDTO> recentResources) {
}
