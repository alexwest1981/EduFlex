package com.eduflex.backend.repository;

import com.eduflex.backend.model.AcademicTerm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AcademicTermRepository extends JpaRepository<AcademicTerm, Long> {
    List<AcademicTerm> findByAcademicYear(String academicYear);
}
