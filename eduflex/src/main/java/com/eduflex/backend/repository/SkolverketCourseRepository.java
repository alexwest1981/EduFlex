package com.eduflex.backend.repository;

import com.eduflex.backend.model.SkolverketCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkolverketCourseRepository extends JpaRepository<SkolverketCourse, Long> {

    Optional<SkolverketCourse> findByCourseCode(String courseCode);

    List<SkolverketCourse> findBySubjectOrderByCourseName(String subject);

    List<SkolverketCourse> findByCourseNameContainingIgnoreCaseOrderByCourseName(String search);

    @Query("SELECT s FROM SkolverketCourse s WHERE LOWER(s.courseName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.courseCode) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY s.courseName")
    List<SkolverketCourse> searchByNameOrCode(String search);

    @Query("SELECT DISTINCT s.subject FROM SkolverketCourse s ORDER BY s.subject")
    List<String> findAllSubjects();
}
