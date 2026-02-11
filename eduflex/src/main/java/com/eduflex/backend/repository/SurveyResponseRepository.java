package com.eduflex.backend.repository;

import com.eduflex.backend.model.survey.SurveyResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, Long> {
    List<SurveyResponse> findByDistributionId(Long distributionId);

    Optional<SurveyResponse> findByDistributionIdAndRespondentId(Long distributionId, Long respondentId);

    long countByDistributionId(Long distributionId);

    boolean existsByDistributionIdAndRespondentId(Long distributionId, Long respondentId);
}
