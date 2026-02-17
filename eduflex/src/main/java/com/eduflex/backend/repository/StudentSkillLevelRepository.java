package com.eduflex.backend.repository;

import com.eduflex.backend.model.StudentSkillLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentSkillLevelRepository extends JpaRepository<StudentSkillLevel, Long> {
    List<StudentSkillLevel> findByStudentId(Long studentId);

    Optional<StudentSkillLevel> findByStudentIdAndSkillId(Long studentId, Long skillId);
}
