package com.eduflex.backend.repository;

import com.eduflex.backend.model.Cmi5Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface Cmi5PackageRepository extends JpaRepository<Cmi5Package, Long> {
    List<Cmi5Package> findByCourseId(Long courseId);

    java.util.Optional<Cmi5Package> findByPackageId(String packageId);
}
