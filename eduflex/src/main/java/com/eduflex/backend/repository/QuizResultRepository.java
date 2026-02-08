package com.eduflex.backend.repository;

import com.eduflex.backend.model.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    List<QuizResult> findByStudentId(Long studentId);

    List<QuizResult> findByQuizId(Long quizId);

    List<QuizResult> findByStudentIdAndQuizCourseId(Long studentId, Long courseId);

    List<QuizResult> findByQuizIdAndStudentId(Long quizId, Long studentId);
}