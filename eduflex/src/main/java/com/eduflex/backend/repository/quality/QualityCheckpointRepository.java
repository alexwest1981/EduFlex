package com.eduflex.backend.repository.quality;

import com.eduflex.backend.model.quality.QualityCheckpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QualityCheckpointRepository extends JpaRepository<QualityCheckpoint, Long> {
    List<QualityCheckpoint> findByIsCompletedFalseOrderByScheduledDateAsc();
}
