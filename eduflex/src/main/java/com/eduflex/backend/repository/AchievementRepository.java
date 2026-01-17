package com.eduflex.backend.repository;

import com.eduflex.backend.model.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    Optional<Achievement> findByName(String name);

    List<Achievement> findByCategory(String category);

    List<Achievement> findByIsActiveTrue();
}
