package com.eduflex.backend.repository;

import com.eduflex.backend.model.EducationProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EducationProgramRepository extends JpaRepository<EducationProgram, Long> {
    Optional<EducationProgram> findBySlug(String slug);

    Optional<EducationProgram> findBySunCode(String sunCode);
}
