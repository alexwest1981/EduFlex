package com.eduflex.backend.repository;

import com.eduflex.backend.model.LicenseAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LicenseAuditRepository extends JpaRepository<LicenseAudit, Long> {
    List<LicenseAudit> findTop50ByOrderByTimestampDesc();
}
