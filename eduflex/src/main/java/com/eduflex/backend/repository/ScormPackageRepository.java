package com.eduflex.backend.repository;

import com.eduflex.backend.model.ScormPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScormPackageRepository extends JpaRepository<ScormPackage, Long> {
    List<ScormPackage> findByCourseId(Long courseId);
}
