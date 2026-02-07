package com.eduflex.backend.repository;

import com.eduflex.backend.model.ScormPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScormPackageRepository extends JpaRepository<ScormPackage, Long> {
    List<ScormPackage> findByCourseId(Long courseId);
}
