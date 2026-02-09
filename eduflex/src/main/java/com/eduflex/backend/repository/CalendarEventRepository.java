package com.eduflex.backend.repository;

import com.eduflex.backend.model.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    List<CalendarEvent> findByCourseIdOrderByStartTimeAsc(Long courseId);

    List<CalendarEvent> findByOwnerIdOrderByStartTimeAsc(Long ownerId);

    List<CalendarEvent> findByStartTimeBetweenOrderByStartTimeAsc(LocalDateTime start, LocalDateTime end);

    long countByIsUnmanned(boolean isUnmanned);
}
