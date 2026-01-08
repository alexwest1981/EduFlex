package com.eduflex.backend.repository;

import com.eduflex.backend.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    // Denna fanns sedan tidigare
    List<Assignment> findByCourseIdOrderByDueDateAsc(Long courseId);

    // --- LÄGG TILL DENNA FÖR ATT FIXA FELET ---
    List<Assignment> findByCourseId(Long courseId);

    // För Resursbank
    List<Assignment> findByAuthorId(Long authorId);
}