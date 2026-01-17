package com.eduflex.backend.repository;

import com.eduflex.backend.model.UserStreak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserStreakRepository extends JpaRepository<UserStreak, Long> {

    Optional<UserStreak> findByUserIdAndStreakType(Long userId, String streakType);

    Optional<UserStreak> findByUserId(Long userId);
}
