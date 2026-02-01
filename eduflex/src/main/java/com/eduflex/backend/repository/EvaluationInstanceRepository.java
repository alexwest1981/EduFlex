package com.eduflex.backend.repository;

import com.eduflex.backend.model.evaluation.EvaluationInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EvaluationInstanceRepository extends JpaRepository<EvaluationInstance, Long> {
    List<EvaluationInstance> findByCourseId(Long courseId);

    List<EvaluationInstance> findByStatus(EvaluationInstance.EvaluationStatus status);

    List<EvaluationInstance> findByCourseIdInAndStatus(java.util.Collection<Long> courseIds,
            EvaluationInstance.EvaluationStatus status);
}
