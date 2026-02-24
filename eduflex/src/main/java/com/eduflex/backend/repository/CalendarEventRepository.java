package com.eduflex.backend.repository;

import com.eduflex.backend.model.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    List<CalendarEvent> findByCourseIdOrderByStartTimeAsc(Long courseId);

    List<CalendarEvent> findByCourseIdAndStartTimeBetweenOrderByStartTimeAsc(Long courseId, LocalDateTime start,
            LocalDateTime end);

    List<CalendarEvent> findByOwnerIdOrderByStartTimeAsc(Long ownerId);

    List<CalendarEvent> findByStartTimeBetweenOrderByStartTimeAsc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT e FROM CalendarEvent e JOIN e.attendees a WHERE a.id = :userId AND e.startTime BETWEEN :start AND :end ORDER BY e.startTime ASC")
    List<CalendarEvent> findByAttendeeIdAndStartTimeBetween(@Param("userId") Long userId,
            @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    long countByIsUnmanned(boolean isUnmanned);
}
