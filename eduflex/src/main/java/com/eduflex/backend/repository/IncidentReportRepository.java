package com.eduflex.backend.repository;

import com.eduflex.backend.model.IncidentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentReportRepository extends JpaRepository<IncidentReport, Long> {
    List<IncidentReport> findByStatus(IncidentReport.Status status);
    List<IncidentReport> findByInvolvedStudentId(Long studentId);
}
