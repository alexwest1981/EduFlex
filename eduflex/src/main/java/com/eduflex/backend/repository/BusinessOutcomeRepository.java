package com.eduflex.backend.repository;

import com.eduflex.backend.model.BusinessOutcome;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusinessOutcomeRepository extends JpaRepository<BusinessOutcome, Long> {
    List<BusinessOutcome> findByUserId(Long userId);

    List<BusinessOutcome> findByCourseId(Long courseId);

    List<BusinessOutcome> findByUserIdAndCourseId(Long userId, Long courseId);
}
