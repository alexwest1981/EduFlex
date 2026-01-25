package com.eduflex.backend.model.community;

/**
 * Publication status for community content
 */
public enum PublishStatus {
    PENDING,    // Awaiting admin approval
    PUBLISHED,  // Approved and visible
    REJECTED,   // Rejected by admin
    ARCHIVED    // Removed by author
}
