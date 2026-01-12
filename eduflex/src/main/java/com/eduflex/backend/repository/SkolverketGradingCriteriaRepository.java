package com.eduflex.backend.repository;

import com.eduflex.backend.model.SkolverketCourse;
import com.eduflex.backend.model.SkolverketGradingCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkolverketGradingCriteriaRepository extends JpaRepository<SkolverketGradingCriteria, Long> {

    List<SkolverketGradingCriteria> findByCourseOrderBySortOrder(SkolverketCourse course);

    List<SkolverketGradingCriteria> findByGradeLevel(String gradeLevel);

    void deleteByCourse(SkolverketCourse course);
}
