package com.eduflex.backend.repository;

import com.eduflex.backend.model.CourseEnrollmentDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseEnrollmentDetailsRepository extends JpaRepository<CourseEnrollmentDetails, Long> {

    Optional<CourseEnrollmentDetails> findByCourseIdAndStudentId(Long courseId, Long studentId);

    List<CourseEnrollmentDetails> findByCourseId(Long courseId);

    List<CourseEnrollmentDetails> findByStudentId(Long studentId);

    List<CourseEnrollmentDetails> findByStatus(CourseEnrollmentDetails.EnrollmentStatus status);
}
