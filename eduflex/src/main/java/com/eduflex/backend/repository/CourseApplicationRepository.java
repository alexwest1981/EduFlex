package com.eduflex.backend.repository;

import com.eduflex.backend.model.CourseApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseApplicationRepository extends JpaRepository<CourseApplication, Long> {
    // Hämta alla ansökningar för en viss lärares kurser som har status PENDING
    List<CourseApplication> findByCourseTeacherIdAndStatus(Long teacherId, CourseApplication.Status status);

    // Hämta alla ansökningar en student gjort
    List<CourseApplication> findByStudentId(Long studentId);

    // Kolla om en student redan sökt en specifik kurs
    Optional<CourseApplication> findByCourseIdAndStudentId(Long courseId, Long studentId);
}