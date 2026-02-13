package com.eduflex.backend.repository;

import com.eduflex.backend.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Attendance findByEventIdAndStudentId(Long eventId, Long studentId);

    List<Attendance> findByEventId(Long eventId);

    long countByStudentId(Long studentId);

    long countByStudentIdAndIsPresent(Long studentId, boolean isPresent);

    long countByIsPresent(boolean isPresent);

    @Query("SELECT a FROM Attendance a WHERE a.student.id = :studentId AND CAST(a.event.startTime AS date) = :date")
    List<Attendance> findByStudentIdAndDate(@Param("studentId") Long studentId, @Param("date") LocalDate date);
}