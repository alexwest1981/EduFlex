package com.eduflex.backend.repository;

import com.eduflex.backend.model.StudentRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRecommendationRepository extends JpaRepository<StudentRecommendation, Long> {
    List<StudentRecommendation> findByUserId(Long userId);

    List<StudentRecommendation> findByUserIdAndIsViewedFalse(Long userId);

    List<StudentRecommendation> findByCourseId(Long courseId);
}
