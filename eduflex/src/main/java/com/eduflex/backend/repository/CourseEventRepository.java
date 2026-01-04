package com.eduflex.backend.repository;

import com.eduflex.backend.model.CourseEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseEventRepository extends JpaRepository<CourseEvent, Long> {
    List<CourseEvent> findByCourseIdOrderByStartTimeAsc(Long courseId);
}