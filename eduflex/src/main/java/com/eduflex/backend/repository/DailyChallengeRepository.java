package com.eduflex.backend.repository;

import com.eduflex.backend.model.DailyChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DailyChallengeRepository extends JpaRepository<DailyChallenge, Long> {

    List<DailyChallenge> findByUserIdAndChallengeDateBetween(Long userId, LocalDateTime start, LocalDateTime end);

    List<DailyChallenge> findByUserIdAndCompletedFalseAndChallengeDateBetween(Long userId, LocalDateTime start,
            LocalDateTime end);

    Long countByUserIdAndCompletedTrueAndChallengeDateBetween(Long userId, LocalDateTime start, LocalDateTime end);
}
