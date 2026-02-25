package com.eduflex.backend.repository;

import com.eduflex.backend.model.IspPlannedCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IspPlannedCourseRepository extends JpaRepository<IspPlannedCourse, Long> {
    List<IspPlannedCourse> findByIspId(Long ispId);
}
