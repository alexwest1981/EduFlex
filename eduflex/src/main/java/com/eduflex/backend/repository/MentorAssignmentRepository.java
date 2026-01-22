package com.eduflex.backend.repository;

import com.eduflex.backend.model.MentorAssignment;
import com.eduflex.backend.model.MentorAssignment.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorAssignmentRepository extends JpaRepository<MentorAssignment, Long> {

    /**
     * Find all students assigned to a specific mentor
     */
    @Query("SELECT ma FROM MentorAssignment ma WHERE ma.mentor.id = :mentorId AND ma.status = :status")
    List<MentorAssignment> findByMentorIdAndStatus(@Param("mentorId") Long mentorId, @Param("status") AssignmentStatus status);

    /**
     * Find all active students for a mentor
     */
    default List<MentorAssignment> findActiveStudentsByMentorId(Long mentorId) {
        return findByMentorIdAndStatus(mentorId, AssignmentStatus.ACTIVE);
    }

    /**
     * Find the active mentor for a specific student
     */
    @Query("SELECT ma FROM MentorAssignment ma WHERE ma.student.id = :studentId AND ma.status = :status")
    Optional<MentorAssignment> findByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") AssignmentStatus status);

    /**
     * Find active mentor for a student
     */
    default Optional<MentorAssignment> findActiveMentorForStudent(Long studentId) {
        return findByStudentIdAndStatus(studentId, AssignmentStatus.ACTIVE);
    }

    /**
     * Check if a mentor-student assignment already exists
     */
    @Query("SELECT ma FROM MentorAssignment ma WHERE ma.mentor.id = :mentorId AND ma.student.id = :studentId")
    Optional<MentorAssignment> findByMentorIdAndStudentId(@Param("mentorId") Long mentorId, @Param("studentId") Long studentId);

    /**
     * Get all assignments for a mentor (regardless of status)
     */
    List<MentorAssignment> findByMentorId(Long mentorId);

    /**
     * Get all assignments for a student (regardless of status)
     */
    List<MentorAssignment> findByStudentId(Long studentId);

    /**
     * Delete assignment by mentor and student
     */
    void deleteByMentorIdAndStudentId(Long mentorId, Long studentId);

    /**
     * Count active students for a mentor
     */
    @Query("SELECT COUNT(ma) FROM MentorAssignment ma WHERE ma.mentor.id = :mentorId AND ma.status = 'ACTIVE'")
    long countActiveStudentsByMentorId(@Param("mentorId") Long mentorId);
}
