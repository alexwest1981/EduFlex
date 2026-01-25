package com.eduflex.backend.dto.community;

import java.util.List;

/**
 * Request DTO for publishing content to community
 */
public record CommunityPublishRequest(
        String subject,
        String difficulty,
        String gradeLevel,
        List<String> tags,
        String publicDescription
) {}
