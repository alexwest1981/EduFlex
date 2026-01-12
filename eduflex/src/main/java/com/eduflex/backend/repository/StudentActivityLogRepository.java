package com.eduflex.backend.repository;

import com.eduflex.backend.model.StudentActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StudentActivityLogRepository extends JpaRepository<StudentActivityLog, Long> {

    // Hämta loggar för en specifik kurs, sorterat på datum
    List<StudentActivityLog> findByCourseIdOrderByTimestampDesc(Long courseId);

    // Hämta loggar för en specifik kurs med paginering
    Page<StudentActivityLog> findByCourseId(Long courseId, Pageable pageable);

    // Hämta loggar för en specifik student i en kurs
    List<StudentActivityLog> findByCourseIdAndUserIdOrderByTimestampDesc(Long courseId, Long userId);

    // Hämta loggar inom ett tidsintervall
    List<StudentActivityLog> findByCourseIdAndTimestampBetween(Long courseId, LocalDateTime start, LocalDateTime end);
}
