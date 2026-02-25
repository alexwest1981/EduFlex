package com.eduflex.backend.repository;

import com.eduflex.backend.model.GeneratedReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface GeneratedReportRepository extends JpaRepository<GeneratedReport, Long> {

    /** Alla rapporter, nyast först, utan JSON-data (för listvyer). */
    @Query("SELECT new GeneratedReport(r.id, r.title, r.reportType, r.format, r.educationType, " +
           "r.periodStart, r.periodEnd, r.rowCount, r.generatedBy, r.createdAt, null) " +
           "FROM GeneratedReport r ORDER BY r.createdAt DESC")
    List<GeneratedReport> findAllWithoutData();

    List<GeneratedReport> findByReportTypeOrderByCreatedAtDesc(String reportType);
}
