package com.eduflex.backend.edugame.repository;

import com.eduflex.backend.edugame.model.SocialStreak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SocialStreakRepository extends JpaRepository<SocialStreak, Long> {

    @Query("SELECT s FROM SocialStreak s WHERE (s.user1.id = :userId1 AND s.user2.id = :userId2) OR (s.user1.id = :userId2 AND s.user2.id = :userId1)")
    Optional<SocialStreak> findByUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
