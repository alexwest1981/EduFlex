package com.eduflex.backend.repository;

import com.eduflex.backend.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByAssignmentId(Long assignmentId);

    // För att kolla om en specifik elev redan lämnat in
    Optional<Submission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
}