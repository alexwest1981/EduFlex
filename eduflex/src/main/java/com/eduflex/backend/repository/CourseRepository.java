package com.eduflex.backend.repository;

import com.eduflex.backend.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    // Hitta alla kurser en specifik lärare håller i
    List<Course> findByTeacherId(Long teacherId);

    // Hitta alla kurser en specifik elev går
    // Eftersom Course har en lista "students", kan vi söka så här:
    List<Course> findByStudents_Id(Long studentId);

    // Hitta kurs baserat på kurskod (t.ex. "JAVA01")
    Course findByCourseCode(String courseCode);
}
