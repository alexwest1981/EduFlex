package com.eduflex.backend.dto.community;

import com.eduflex.backend.model.community.CommunitySubject;

/**
 * DTO for subject category information
 */
public record SubjectDTO(
        String name,
        String displayName,
        String iconName,
        String color,
        long itemCount
) {
    /**
     * Create DTO from enum with item count
     */
    public static SubjectDTO fromEnum(CommunitySubject subject, long count) {
        return new SubjectDTO(
                subject.name(),
                subject.getDisplayName(),
                subject.getIconName(),
                subject.getColor(),
                count
        );
    }
}
