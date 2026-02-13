package com.eduflex.backend.repository.quality;

import com.eduflex.backend.model.quality.QualityIndicator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QualityIndicatorRepository extends JpaRepository<QualityIndicator, Long> {
    List<QualityIndicator> findByGoalId(Long goalId);
}
