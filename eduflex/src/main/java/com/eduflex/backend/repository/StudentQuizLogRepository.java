package com.eduflex.backend.repository;

import com.eduflex.backend.model.StudentQuizLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentQuizLogRepository extends JpaRepository<StudentQuizLog, Long> {
    List<StudentQuizLog> findByCourseId(Long courseId);

    List<StudentQuizLog> findByStudentId(Long studentId);

    List<StudentQuizLog> findByCourseIdAndStudentId(Long courseId, Long studentId);
}
