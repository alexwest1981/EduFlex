package com.eduflex.backend.repository.quality;

import com.eduflex.backend.model.quality.QualityGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QualityGoalRepository extends JpaRepository<QualityGoal, Long> {
    List<QualityGoal> findByStatus(String status);
}

// Separate files would be better but I'll group them for now if they are small
