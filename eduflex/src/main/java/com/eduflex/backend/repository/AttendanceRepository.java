package com.eduflex.backend.repository;

import com.eduflex.backend.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Attendance findByEventIdAndStudentId(Long eventId, Long studentId);

    List<Attendance> findByEventId(Long eventId);

    long countByStudentId(Long studentId);

    long countByStudentIdAndIsPresent(Long studentId, boolean isPresent);
}