package com.eduflex.backend.repository;

import com.eduflex.backend.model.CourseSkillMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseSkillMappingRepository extends JpaRepository<CourseSkillMapping, Long> {
    List<CourseSkillMapping> findByCourseId(Long courseId);
}
