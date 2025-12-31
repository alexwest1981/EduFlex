package com.eduflex.backend.repository;

import com.eduflex.backend.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    // Metod för att kolla om en användare redan har en viss badge
    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);
}