package com.eduflex.backend.repository;

import com.eduflex.backend.model.evaluation.EvaluationResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationResponseRepositoryV2 extends JpaRepository<EvaluationResponse, Long> {
    List<EvaluationResponse> findByInstanceId(Long instanceId);

    Optional<EvaluationResponse> findByInstanceIdAndStudentIdHash(Long instanceId, String studentIdHash);

    long countByInstanceId(Long instanceId);
}
