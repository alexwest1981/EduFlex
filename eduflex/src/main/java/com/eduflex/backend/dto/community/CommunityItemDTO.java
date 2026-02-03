package com.eduflex.backend.dto.community;

import com.eduflex.backend.model.community.CommunityItem;
import com.eduflex.backend.model.community.ContentType;
import com.eduflex.backend.model.community.PublishStatus;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for displaying community items in card/list view
 */
public record CommunityItemDTO(
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
        Long authorUserId,
        String authorName,
        String authorTenantName,
        String authorProfilePictureUrl,
        double averageRating,
        int ratingCount,
        int downloadCount,
        LocalDateTime publishedAt,
        PublishStatus status,
        Map<String, Object> metadata) {
    /**
     * Create DTO from entity
     */
    public static CommunityItemDTO fromEntity(CommunityItem item, Map<String, Object> parsedMetadata) {
        return new CommunityItemDTO(
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
                item.getAuthorUserId(),
                item.getAuthorName(),
                item.getAuthorTenantName(),
                item.getAuthorProfilePictureUrl(),
                item.getAverageRating(),
                item.getRatingCount(),
                item.getDownloadCount(),
                item.getPublishedAt(),
                item.getStatus(),
                parsedMetadata);
    }
}
