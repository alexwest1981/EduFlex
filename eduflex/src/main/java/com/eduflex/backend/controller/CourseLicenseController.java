package com.eduflex.backend.controller;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CourseLicense;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseLicenseRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/licenses")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Tag(name = "Course Licenses", description = "Endpoints for managing B2B seat licenses")
public class CourseLicenseController {

    private final CourseLicenseRepository courseLicenseRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseLicenseController(CourseLicenseRepository courseLicenseRepository,
            CourseRepository courseRepository,
            UserRepository userRepository) {
        this.courseLicenseRepository = courseLicenseRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "Get all company licenses", description = "Returns active course licenses for the current tenant/company.")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getCompanyLicenses(Authentication authentication) {
        if (authentication == null)
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        User currentUser = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (currentUser == null)
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        // Return all licenses for this tenant schema
        List<CourseLicense> licenses = courseLicenseRepository.findAll();
        return ResponseEntity.ok(licenses);
    }

    @PostMapping("/{licenseId}/assign/{userId}")
    @Operation(summary = "Manually assign a seat", description = "Assigns a seat from a course license to a specific user.")
    @Transactional
    public ResponseEntity<?> assignSeat(@PathVariable Long licenseId, @PathVariable Long userId,
            Authentication authentication) {
        if (authentication == null)
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        User currentUser = userRepository.findByUsername(authentication.getName()).orElse(null);

        // Determine role (only ADMIN/REKTOR can manually assign for their company)
        if (currentUser == null || (!currentUser.getRole().getName().contains("ADMIN")
                && !currentUser.getRole().getName().contains("REKTOR"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }

        CourseLicense license = courseLicenseRepository.findById(licenseId).orElse(null);
        if (license == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "License not found."));
        }

        if (license.getUsedSeats() >= license.getTotalSeats() ||
                (license.getExpiresAt() != null && license.getExpiresAt().isBefore(LocalDateTime.now())) ||
                license.getStatus() != CourseLicense.LicenseStatus.ACTIVE) {
            return ResponseEntity.badRequest().body(Map.of("error", "License is exhausted or inactive."));
        }

        User student = userRepository.findById(userId).orElse(null);
        if (student == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found."));
        }

        Course course = courseRepository.findById(license.getCourseId()).orElse(null);
        if (course == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Associated course not found."));
        }

        // Check if student is already enrolled
        if (course.getStudents().contains(student)) {
            return ResponseEntity.badRequest().body(Map.of("error", "User is already enrolled in this course."));
        }

        // Enroll Student
        course.getStudents().add(student);
        courseRepository.save(course);

        // Consume a seat
        license.setUsedSeats(license.getUsedSeats() + 1);
        courseLicenseRepository.save(license);

        return ResponseEntity.ok(Map.of("message", "Seat successfully assigned and user enrolled."));
    }
}
