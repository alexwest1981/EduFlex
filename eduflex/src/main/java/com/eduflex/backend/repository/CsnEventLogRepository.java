package com.eduflex.backend.repository;

import com.eduflex.backend.model.CsnEventLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CsnEventLogRepository extends JpaRepository<CsnEventLog, Long> {

    List<CsnEventLog> findByCourseIdAndStudentId(Long courseId, Long studentId);

    List<CsnEventLog> findByReportedToCsnFalse();

    List<CsnEventLog> findByEventCodeAndReportedToCsnFalse(String eventCode);

    List<CsnEventLog> findByCourseIdAndEventDateBetween(Long courseId, LocalDateTime start, LocalDateTime end);
}
