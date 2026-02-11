package com.eduflex.backend.repository;

import com.eduflex.backend.model.survey.SurveyTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyTemplateRepository extends JpaRepository<SurveyTemplate, Long> {
    List<SurveyTemplate> findByIsActiveTrueOrderByCreatedAtDesc();
}
