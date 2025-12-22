package com.eduflex.backend.repository;

import com.eduflex.backend.model.Course;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    // Denna metod hämtar kursen PLUS lärare och studenter i samma fråga
    @EntityGraph(attributePaths = {"teacher", "students", "evaluation"})
    List<Course> findAll();

    // Samma sak för en specifik kurs
    @EntityGraph(attributePaths = {"teacher", "students", "evaluation"})
    Optional<Course> findById(Long id);
}