package com.eduflex.backend.repository;

import com.eduflex.backend.model.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {
    List<UserAchievement> findByUserId(Long userId);

    Optional<UserAchievement> findByUserIdAndAchievementId(Long userId, Long achievementId);

    List<UserAchievement> findByUserIdAndUnlockedTrue(Long userId);
}
