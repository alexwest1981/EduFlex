package com.eduflex.backend.repository;

import com.eduflex.backend.model.ExamIntegrityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamIntegrityRepository extends JpaRepository<ExamIntegrityEvent, Long> {
    List<ExamIntegrityEvent> findByQuizId(Long quizId);

    List<ExamIntegrityEvent> findByQuizIdAndStudentId(Long quizId, Long studentId);

    List<ExamIntegrityEvent> findByQuizIdInOrderByTimestampDesc(List<Long> quizIds);
}
