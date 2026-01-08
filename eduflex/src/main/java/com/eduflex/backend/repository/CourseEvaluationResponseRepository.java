package com.eduflex.backend.repository;

import com.eduflex.backend.model.CourseEvaluationResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseEvaluationResponseRepository extends JpaRepository<CourseEvaluationResponse, Long> {
    List<CourseEvaluationResponse> findByEvaluationId(Long evaluationId);

    boolean existsByEvaluationIdAndStudentId(Long evaluationId, Long studentId);
}
