package com.eduflex.backend.repository;

import com.eduflex.backend.model.CourseLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseLicenseRepository extends JpaRepository<CourseLicense, Long> {

    List<CourseLicense> findByCourseId(Long courseId);

    List<CourseLicense> findByStatus(CourseLicense.LicenseStatus status);

    Optional<CourseLicense> findByOrderId(Long orderId);
}
