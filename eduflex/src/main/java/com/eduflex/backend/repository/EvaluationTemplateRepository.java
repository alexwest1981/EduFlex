package com.eduflex.backend.repository;

import com.eduflex.backend.model.evaluation.EvaluationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EvaluationTemplateRepository extends JpaRepository<EvaluationTemplate, Long> {
    List<EvaluationTemplate> findByIsSystemTemplateTrue();

    List<EvaluationTemplate> findByCreatedById(Long userId);
}
