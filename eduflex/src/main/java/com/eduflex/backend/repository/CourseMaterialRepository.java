package com.eduflex.backend.repository;

import com.eduflex.backend.model.CourseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, Long> {
    // Hämta allt material för en viss kurs
    List<CourseMaterial> findByCourseId(Long courseId);
}