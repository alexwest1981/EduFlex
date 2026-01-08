package com.eduflex.backend.repository;

import com.eduflex.backend.model.CourseResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CourseResultRepository extends JpaRepository<CourseResult, Long> {
    Optional<CourseResult> findByCourseIdAndStudentId(Long courseId, Long studentId);

    List<CourseResult> findByCourseId(Long courseId);
}
