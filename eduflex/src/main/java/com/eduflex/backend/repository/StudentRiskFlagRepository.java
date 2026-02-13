package com.eduflex.backend.repository;

import com.eduflex.backend.model.StudentRiskFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRiskFlagRepository extends JpaRepository<StudentRiskFlag, Long> {

    List<StudentRiskFlag> findByStudentId(Long studentId);

    Optional<StudentRiskFlag> findTopByStudentIdOrderByLastCalculatedDesc(Long studentId);

    @Query("SELECT r FROM StudentRiskFlag r WHERE r.riskLevel IN ('HIGH', 'CRITICAL') ORDER BY r.lastCalculated DESC")
    List<StudentRiskFlag> findHighRiskFlags();

    @Query("SELECT r FROM StudentRiskFlag r WHERE r.student.id IN (SELECT student.id FROM MentorAssignment m WHERE m.mentor.id = :mentorId) AND r.riskLevel IN ('HIGH', 'CRITICAL')")
    List<StudentRiskFlag> findHighRiskFlagsForMentor(Long mentorId);
}
