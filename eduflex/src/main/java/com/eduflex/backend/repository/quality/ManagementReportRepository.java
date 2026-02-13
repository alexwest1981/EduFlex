package com.eduflex.backend.repository.quality;

import com.eduflex.backend.model.quality.ManagementReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ManagementReportRepository extends JpaRepository<ManagementReport, Long> {
    List<ManagementReport> findAllByOrderByCreatedAtDesc();
}
