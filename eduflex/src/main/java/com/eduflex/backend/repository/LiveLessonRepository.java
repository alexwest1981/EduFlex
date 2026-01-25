package com.eduflex.backend.repository;

import com.eduflex.backend.model.LiveLesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LiveLessonRepository extends JpaRepository<LiveLesson, Long> {

    // Find by room name
    Optional<LiveLesson> findByRoomName(String roomName);

    // Find all lessons for a course
    List<LiveLesson> findByCourseIdOrderByScheduledStartDesc(Long courseId);

    // Find lessons by host
    List<LiveLesson> findByHostIdOrderByScheduledStartDesc(Long hostId);

    // Find active/live lessons
    List<LiveLesson> findByStatus(LiveLesson.Status status);

    // Find upcoming lessons for a course
    @Query("SELECT l FROM LiveLesson l WHERE l.course.id = :courseId " +
           "AND l.scheduledStart > :now AND l.status = :status " +
           "ORDER BY l.scheduledStart ASC")
    List<LiveLesson> findUpcomingByCourseId(@Param("courseId") Long courseId, @Param("now") LocalDateTime now, @Param("status") LiveLesson.Status status);

    // Find lessons starting soon (within X minutes)
    @Query("SELECT l FROM LiveLesson l WHERE l.scheduledStart BETWEEN :start AND :end " +
           "AND l.status = :status ORDER BY l.scheduledStart ASC")
    List<LiveLesson> findStartingSoon(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("status") LiveLesson.Status status);

    // Find all active lessons (live now)
    @Query("SELECT l FROM LiveLesson l WHERE l.status = :status")
    List<LiveLesson> findAllLive(@Param("status") LiveLesson.Status status);

    // Find lessons for student (via enrolled courses)
    @Query("SELECT l FROM LiveLesson l JOIN l.course c JOIN c.students s " +
           "WHERE s.id = :studentId AND l.status IN :statuses " +
           "AND l.scheduledStart > :now ORDER BY l.scheduledStart ASC")
    List<LiveLesson> findUpcomingForStudent(@Param("studentId") Long studentId, @Param("now") LocalDateTime now, @Param("statuses") List<LiveLesson.Status> statuses);

    // Find upcoming lessons for teacher (as host)
    @Query("SELECT l FROM LiveLesson l WHERE l.host.id = :teacherId " +
           "AND l.status IN :statuses " +
           "AND l.scheduledStart > :minusHour ORDER BY l.scheduledStart ASC")
    List<LiveLesson> findUpcomingForTeacher(@Param("teacherId") Long teacherId, @Param("minusHour") LocalDateTime minusHour, @Param("statuses") List<LiveLesson.Status> statuses);
}
