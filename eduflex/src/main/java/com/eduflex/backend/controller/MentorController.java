package com.eduflex.backend.controller;

import com.eduflex.backend.model.MentorAssignment;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.MentorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
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

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(MentorController.class);

    /**
     * Helper to get current user from SecurityContext
     */
    private User getCurrentUser() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()
                || auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                org.springframework.http.HttpStatus.NOT_FOUND, "User not found: " + username)));
    }

    /**
     * Assign a student to the current mentor
     * POST /api/mentors/assignments
     */
    @PostMapping("/assignments")
    public ResponseEntity<?> assignStudent(@RequestBody AssignmentRequest request, HttpServletRequest requestObj) {
        try {
            User currentUser = getCurrentUser();
            MentorAssignment assignment = mentorService.assignStudentToMentor(
                    currentUser.getId(),
                    request.getStudentId(),
                    currentUser.getId());
            return ResponseEntity.ok(assignment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            logger.error("💥 Persistent error in {}: {}", requestObj.getRequestURI(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Bulk assign multiple students
     * POST /api/mentors/assignments/bulk
     */
    @PostMapping("/assignments/bulk")
    public ResponseEntity<?> bulkAssignStudents(@RequestBody BulkAssignmentRequest request,
            HttpServletRequest requestObj) {
        try {
            User currentUser = getCurrentUser();
            List<MentorAssignment> assignments = mentorService.bulkAssignStudents(
                    currentUser.getId(),
                    request.getStudentIds(),
                    currentUser.getId());
            return ResponseEntity.ok(assignments);
        } catch (org.springframework.web.server.ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            logger.error("💥 Persistent error in {}: {}", requestObj.getRequestURI(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all active students for the current mentor
     * GET /api/mentors/my-students
     */
    @GetMapping("/my-students")
    public ResponseEntity<?> getMyStudents(HttpServletRequest requestObj) {
        try {
            User currentUser = getCurrentUser();
            List<User> students = mentorService.getActiveStudentsForMentor(currentUser.getId());
            return ResponseEntity.ok(students);
        } catch (org.springframework.web.server.ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            logger.error("💥 Persistent error in {}: {}", requestObj.getRequestURI(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all assignments for the current mentor (including inactive)
     * GET /api/mentors/assignments
     */
    @GetMapping("/assignments")
    public ResponseEntity<?> getMyAssignments(HttpServletRequest requestObj) {
        try {
            User currentUser = getCurrentUser();
            List<MentorAssignment> assignments = mentorService.getAllAssignmentsForMentor(currentUser.getId());
            return ResponseEntity.ok(assignments);
        } catch (org.springframework.web.server.ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            logger.error("💥 Persistent error in {}: {}", requestObj.getRequestURI(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get active students count for the current mentor
     * GET /api/mentors/students/count
     */
    @GetMapping("/students/count")
    public ResponseEntity<?> getStudentCount(HttpServletRequest requestObj) {
        try {
            User currentUser = getCurrentUser();
            long count = mentorService.getActiveStudentCount(currentUser.getId());
            return ResponseEntity.ok(Map.of("count", count));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            logger.error("💥 Persistent error in {}: {}", requestObj.getRequestURI(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get unassigned students (for searching/adding)
     * GET /api/mentors/students/unassigned
     */
    @GetMapping("/students/unassigned")
    public ResponseEntity<?> getUnassignedStudents(HttpServletRequest requestObj) {
        try {
            User currentUser = getCurrentUser();
            List<User> students = mentorService.getUnassignedStudentsForMentor(currentUser.getId());
            return ResponseEntity.ok(students);
        } catch (org.springframework.web.server.ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            logger.error("💥 Persistent error in {}: {}", requestObj.getRequestURI(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Remove a student from the current mentor
     * DELETE /api/mentors/assignments/{studentId}
     */
    @DeleteMapping("/assignments/{studentId}")
    public ResponseEntity<?> removeStudent(@PathVariable Long studentId, HttpServletRequest requestObj) {
        try {
            User currentUser = getCurrentUser();
            mentorService.removeStudentFromMentor(currentUser.getId(), studentId);
            return ResponseEntity.ok(Map.of("message", "Student removed successfully"));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            logger.error("💥 Persistent error in {}: {}", requestObj.getRequestURI(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
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

    /**
     * Get overview for the mentor's assigned class
     * GET /api/mentors/class-overview
     */
    @GetMapping("/class-overview")
    public ResponseEntity<?> getClassOverview() {
        try {
            User currentUser = getCurrentUser();
            return ResponseEntity.ok(mentorService.getClassOverview(currentUser.getId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get pupils in the mentor's assigned class with detailed stats
     * GET /api/mentors/my-class/pupils
     */
    @GetMapping("/my-class/pupils")
    public ResponseEntity<?> getMyClassPupils() {
        try {
            User currentUser = getCurrentUser();
            return ResponseEntity.ok(mentorService.getPupilsInClass(currentUser.getId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
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
