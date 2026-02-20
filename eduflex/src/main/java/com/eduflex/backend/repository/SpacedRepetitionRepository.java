package com.eduflex.backend.repository;

import com.eduflex.backend.model.SpacedRepetitionItem;
import com.eduflex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SpacedRepetitionRepository extends JpaRepository<SpacedRepetitionItem, Long> {

    List<SpacedRepetitionItem> findByUser(User user);

    /**
     * Finds items that are due for review.
     */
    @Query("SELECT s FROM SpacedRepetitionItem s WHERE s.user = :user AND s.nextReviewDate <= :now ORDER BY s.nextReviewDate ASC")
    List<SpacedRepetitionItem> findDueItems(User user, LocalDateTime now);

    List<SpacedRepetitionItem> findByUserId(Long userId);

    List<SpacedRepetitionItem> findByUserIdAndCategoryAndSourceId(Long userId, String category, Long sourceId);
}
