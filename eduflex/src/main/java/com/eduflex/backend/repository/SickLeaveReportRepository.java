package com.eduflex.backend.repository;

import com.eduflex.backend.model.SickLeaveReport;
import com.eduflex.backend.model.SickLeaveReport.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SickLeaveReportRepository extends JpaRepository<SickLeaveReport, Long> {

    List<SickLeaveReport> findByUserIdAndStatusOrderByStartDateDesc(Long userId, Status status);

    List<SickLeaveReport> findByUserIdOrderByReportedAtDesc(Long userId);

    @Query("SELECT s FROM SickLeaveReport s WHERE s.status = 'ACTIVE' " +
            "AND s.startDate <= :today AND (s.endDate >= :today OR s.endDate IS NULL)")
    List<SickLeaveReport> findActiveTodayReports(@Param("today") LocalDate today);
}
