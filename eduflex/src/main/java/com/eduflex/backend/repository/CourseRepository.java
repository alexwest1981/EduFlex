package com.eduflex.backend.repository;

import com.eduflex.backend.model.Course;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    @EntityGraph(attributePaths = { "teacher", "students", "evaluation" })
    List<Course> findAll();

    @EntityGraph(attributePaths = { "teacher", "students", "evaluation" })
    Optional<Course> findById(Long id);

    List<Course> findByStudentsId(Long studentId);

    List<Course> findByTeacherId(Long teacherId);

    Optional<Course> findByCourseCode(String courseCode);

    Optional<Course> findBySlug(String slug);
}