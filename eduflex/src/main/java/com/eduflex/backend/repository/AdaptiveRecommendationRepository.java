package com.eduflex.backend.repository;

import com.eduflex.backend.model.AdaptiveRecommendation;
import com.eduflex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdaptiveRecommendationRepository extends JpaRepository<AdaptiveRecommendation, Long> {
    List<AdaptiveRecommendation> findByUser(User user);

    List<AdaptiveRecommendation> findByUserIdAndStatus(Long userId, AdaptiveRecommendation.Status status);

    List<AdaptiveRecommendation> findByUserIdAndStatusOrderByPriorityScoreDesc(Long userId,
            AdaptiveRecommendation.Status status);

    List<AdaptiveRecommendation> findByUserIdAndStatusInOrderByPriorityScoreDesc(Long userId,
            List<AdaptiveRecommendation.Status> statuses);
}
