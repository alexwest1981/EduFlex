package com.eduflex.backend.repository;

import com.eduflex.backend.model.ClassGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassGroupRepository extends JpaRepository<ClassGroup, Long> {
    List<ClassGroup> findByProgramId(Long programId);
}
