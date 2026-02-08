package com.eduflex.backend.repository;

import com.eduflex.backend.model.Cmi5Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface Cmi5ProgressRepository extends JpaRepository<Cmi5Progress, Long> {
    Optional<Cmi5Progress> findByUserIdAndCmi5PackageIdAndRegistration(Long userId, Long cmi5PackageId,
            String registration);

    List<Cmi5Progress> findByUserIdAndCmi5PackageId(Long userId, Long cmi5PackageId);
}
