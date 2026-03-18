package com.eduflex.scorm.repository;

import com.eduflex.scorm.model.Cmi5Package;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface Cmi5PackageRepository extends JpaRepository<Cmi5Package, Long> {
    List<Cmi5Package> findByCourseId(Long courseId);

    Optional<Cmi5Package> findByPackageId(String packageId);
}
