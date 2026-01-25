package com.eduflex.backend.repository.community;

import com.eduflex.backend.model.community.CommunityDownload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityDownloadRepository extends JpaRepository<CommunityDownload, String> {

    /**
     * Check if user already downloaded/installed this item
     */
    Optional<CommunityDownload> findByCommunityItemIdAndUserIdAndTenantId(
            String communityItemId, Long userId, String tenantId);

    /**
     * Check if item exists for user (for "already installed" status)
     */
    boolean existsByCommunityItemIdAndUserIdAndTenantId(
            String communityItemId, Long userId, String tenantId);

    /**
     * Get all downloads by a user
     */
    List<CommunityDownload> findByUserIdAndTenantIdOrderByDownloadedAtDesc(
            Long userId, String tenantId);

    /**
     * Count total downloads for an item
     */
    long countByCommunityItemId(String communityItemId);
}
