package com.eduflex.backend.dto.community;

import com.eduflex.backend.model.community.CommunityRating;

import java.time.LocalDateTime;

/**
 * DTO for displaying ratings/reviews
 */
public record CommunityRatingDTO(
        String id,
        int rating,
        String comment,
        String reviewerName,
        LocalDateTime createdAt
) {
    /**
     * Create DTO from entity
     */
    public static CommunityRatingDTO fromEntity(CommunityRating rating) {
        return new CommunityRatingDTO(
                rating.getId(),
                rating.getRating(),
                rating.getComment(),
                rating.getReviewerName(),
                rating.getCreatedAt()
        );
    }
}
