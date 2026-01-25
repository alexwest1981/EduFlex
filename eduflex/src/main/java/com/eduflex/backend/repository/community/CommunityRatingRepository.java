package com.eduflex.backend.repository.community;

import com.eduflex.backend.model.community.CommunityRating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityRatingRepository extends JpaRepository<CommunityRating, String> {

    /**
     * Find all ratings for a community item
     */
    Page<CommunityRating> findByCommunityItemIdOrderByCreatedAtDesc(String communityItemId, Pageable pageable);

    List<CommunityRating> findByCommunityItemIdOrderByCreatedAtDesc(String communityItemId);

    /**
     * Check if user already rated this item
     */
    Optional<CommunityRating> findByCommunityItemIdAndUserIdAndTenantId(
            String communityItemId, Long userId, String tenantId);

    /**
     * Calculate average rating for an item
     */
    @Query("SELECT AVG(r.rating), COUNT(r) FROM CommunityRating r WHERE r.communityItemId = :itemId")
    List<Object[]> calculateRatingStats(@Param("itemId") String communityItemId);

    /**
     * Count ratings for an item
     */
    long countByCommunityItemId(String communityItemId);

    /**
     * Get recent ratings for display (limit to top 5)
     */
    List<CommunityRating> findTop5ByCommunityItemIdOrderByCreatedAtDesc(String communityItemId);
}
