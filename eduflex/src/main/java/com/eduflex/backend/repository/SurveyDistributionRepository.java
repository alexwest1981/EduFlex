package com.eduflex.backend.repository;

import com.eduflex.backend.model.survey.SurveyDistribution;
import com.eduflex.backend.model.survey.SurveyDistribution.DistributionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyDistributionRepository extends JpaRepository<SurveyDistribution, Long> {
    List<SurveyDistribution> findByTargetRoleAndStatus(String targetRole, DistributionStatus status);

    List<SurveyDistribution> findAllByOrderByCreatedAtDesc();
}
