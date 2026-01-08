package com.eduflex.backend.repository;

import com.eduflex.backend.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByAssignmentId(Long assignmentId);

    Optional<Submission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);

    List<Submission> findByStudentIdAndAssignmentCourseId(Long studentId, Long courseId);
}