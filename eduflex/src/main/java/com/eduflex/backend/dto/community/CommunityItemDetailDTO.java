package com.eduflex.backend.dto.community;

import com.eduflex.backend.model.community.CommunityItem;
import com.eduflex.backend.model.community.ContentType;
import com.eduflex.backend.model.community.PublishStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO for displaying community item details in modal view
 */
public record CommunityItemDetailDTO(
        String id,
        ContentType contentType,
        String title,
        String description,
        String subject,
        String subjectDisplayName,
        String subjectIcon,
        String subjectColor,
        String difficulty,
        String gradeLevel,
        List<String> tags,
        String authorName,
        String authorTenantName,
        String authorProfilePictureUrl,
        Long authorUserId,
        double averageRating,
        int ratingCount,
        int downloadCount,
        LocalDateTime publishedAt,
        LocalDateTime createdAt,
        PublishStatus status,
        String rejectionReason,
        Map<String, Object> metadata,
        List<CommunityRatingDTO> recentRatings,
        boolean alreadyInstalled
) {
    /**
     * Create DTO from entity with ratings and installation status
     */
    public static CommunityItemDetailDTO fromEntity(
            CommunityItem item,
            Map<String, Object> parsedMetadata,
            List<CommunityRatingDTO> ratings,
            boolean installed
    ) {
        return new CommunityItemDetailDTO(
                item.getId(),
                item.getContentType(),
                item.getTitle(),
                item.getDescription(),
                item.getSubject() != null ? item.getSubject().name() : null,
                item.getSubject() != null ? item.getSubject().getDisplayName() : null,
                item.getSubject() != null ? item.getSubject().getIconName() : "folder",
                item.getSubject() != null ? item.getSubject().getColor() : "#94A3B8",
                item.getDifficulty(),
                item.getGradeLevel(),
                item.getTags(),
                item.getAuthorName(),
                item.getAuthorTenantName(),
                item.getAuthorProfilePictureUrl(),
                item.getAuthorUserId(),
                item.getAverageRating(),
                item.getRatingCount(),
                item.getDownloadCount(),
                item.getPublishedAt(),
                item.getCreatedAt(),
                item.getStatus(),
                item.getRejectionReason(),
                parsedMetadata,
                ratings,
                installed
        );
    }
}
