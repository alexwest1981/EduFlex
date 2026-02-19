package com.eduflex.backend.repository;

import com.eduflex.backend.model.CoachRecommendation;
import com.eduflex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CoachRecommendationRepository extends JpaRepository<CoachRecommendation, Long> {
    List<CoachRecommendation> findByUserOrderByCreatedAtDesc(User user);

    List<CoachRecommendation> findByUserAndIsReadOrderByCreatedAtDesc(User user, boolean isRead);
}
