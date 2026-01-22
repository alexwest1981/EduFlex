package com.eduflex.backend.controller;

import com.eduflex.backend.model.MentorAssignment;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.MentorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/mentors")
@CrossOrigin(origins = "*")
public class MentorController {

    @Autowired
    private MentorService mentorService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Helper to get current user from Principal (supports both Jwt and UserDetails)
     */
    private User getCurrentUser(Object principal) {
        if (principal == null) {
            throw new IllegalArgumentException("Authentication required");
        }

        String username = null;
        if (principal instanceof org.springframework.security.oauth2.jwt.Jwt jwt) {
            username = jwt.getClaimAsString("email");
            if (username == null) {
                username = jwt.getClaimAsString("preferred_username");
            }
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            username = userDetails.getUsername();
        }

        if (username == null) {
            throw new IllegalArgumentException("User identity not found in principal");
        }

        return userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new IllegalArgumentException("User not found: " + username)));
    }

    /**
     * Assign a student to the current mentor
     * POST /api/mentors/assignments
     */
    @PostMapping("/assignments")
    public ResponseEntity<?> assignStudent(
            @RequestBody AssignmentRequest request,
            @AuthenticationPrincipal Object principal) {
        try {
            User currentUser = getCurrentUser(principal);
            MentorAssignment assignment = mentorService.assignStudentToMentor(
                    currentUser.getId(),
                    request.getStudentId(),
                    currentUser.getId());
            return ResponseEntity.ok(assignment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to assign student: " + e.getMessage()));
        }
    }

    /**
     * Bulk assign multiple students
     * POST /api/mentors/assignments/bulk
     */
    @PostMapping("/assignments/bulk")
    public ResponseEntity<?> bulkAssignStudents(
            @RequestBody BulkAssignmentRequest request,
            @AuthenticationPrincipal Object principal) {
        try {
            User currentUser = getCurrentUser(principal);
            List<MentorAssignment> assignments = mentorService.bulkAssignStudents(
                    currentUser.getId(),
                    request.getStudentIds(),
                    currentUser.getId());
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to bulk assign students: " + e.getMessage()));
        }
    }

    /**
     * Get all active students for the current mentor
     * GET /api/mentors/my-students
     */
    @GetMapping("/my-students")
    public ResponseEntity<?> getMyStudents(@AuthenticationPrincipal Object principal) {
        try {
            User currentUser = getCurrentUser(principal);
            List<User> students = mentorService.getActiveStudentsForMentor(currentUser.getId());
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get students: " + e.getMessage()));
        }
    }

    /**
     * Get all assignments for the current mentor (including inactive)
     * GET /api/mentors/assignments
     */
    @GetMapping("/assignments")
    public ResponseEntity<?> getMyAssignments(@AuthenticationPrincipal Object principal) {
        try {
            User currentUser = getCurrentUser(principal);
            List<MentorAssignment> assignments = mentorService.getAllAssignmentsForMentor(currentUser.getId());
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get assignments: " + e.getMessage()));
        }
    }

    /**
     * Get active students count for the current mentor
     * GET /api/mentors/students/count
     */
    @GetMapping("/students/count")
    public ResponseEntity<?> getStudentCount(@AuthenticationPrincipal Object principal) {
        try {
            User currentUser = getCurrentUser(principal);
            long count = mentorService.getActiveStudentCount(currentUser.getId());
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get student count: " + e.getMessage()));
        }
    }

    /**
     * Get unassigned students (for searching/adding)
     * GET /api/mentors/students/unassigned
     */
    @GetMapping("/students/unassigned")
    public ResponseEntity<?> getUnassignedStudents(@AuthenticationPrincipal Object principal) {
        try {
            User currentUser = getCurrentUser(principal);
            List<User> students = mentorService.getUnassignedStudentsForMentor(currentUser.getId());
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get unassigned students: " + e.getMessage()));
        }
    }

    /**
     * Remove a student from the current mentor
     * DELETE /api/mentors/assignments/{studentId}
     */
    @DeleteMapping("/assignments/{studentId}")
    public ResponseEntity<?> removeStudent(
            @PathVariable Long studentId,
            @AuthenticationPrincipal Object principal) {
        try {
            User currentUser = getCurrentUser(principal);
            mentorService.removeStudentFromMentor(currentUser.getId(), studentId);
            return ResponseEntity.ok(Map.of("message", "Student removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to remove student: " + e.getMessage()));
        }
    }

    /**
     * Get mentor for a specific student
     * GET /api/students/{studentId}/mentor
     */
    @GetMapping("/students/{studentId}/mentor")
    public ResponseEntity<?> getMentorForStudent(@PathVariable Long studentId) {
        try {
            Optional<User> mentor = mentorService.getActiveMentorForStudent(studentId);
            if (mentor.isPresent()) {
                return ResponseEntity.ok(mentor.get());
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No active mentor found for this student"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get mentor: " + e.getMessage()));
        }
    }

    /**
     * Get all students (for admin/searching)
     * GET /api/mentors/students/all
     */
    @GetMapping("/students/all")
    public ResponseEntity<?> getAllStudents() {
        try {
            List<User> students = mentorService.getAllStudents();
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get all students: " + e.getMessage()));
        }
    }

    // DTOs for request bodies
    static class AssignmentRequest {
        private Long studentId;

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }
    }

    static class BulkAssignmentRequest {
        private List<Long> studentIds;

        public List<Long> getStudentIds() {
            return studentIds;
        }

        public void setStudentIds(List<Long> studentIds) {
            this.studentIds = studentIds;
        }
    }
}
