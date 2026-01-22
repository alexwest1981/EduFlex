package com.eduflex.backend.service;

import com.eduflex.backend.model.MentorAssignment;
import com.eduflex.backend.model.MentorAssignment.AssignmentStatus;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.MentorAssignmentRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MentorService {

    @Autowired
    private MentorAssignmentRepository mentorAssignmentRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Assign a student to a mentor
     */
    @Transactional
    public MentorAssignment assignStudentToMentor(Long mentorId, Long studentId, Long createdById) {
        // Validate mentor exists and has MENTOR role
        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new IllegalArgumentException("Mentor not found with id: " + mentorId));

        if (mentor.getRole() == null || !mentor.getRole().getName().equals("MENTOR")) {
            throw new IllegalArgumentException("User is not a mentor");
        }

        // Validate student exists and has STUDENT role
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));

        if (student.getRole() == null || !student.getRole().getName().equals("STUDENT")) {
            throw new IllegalArgumentException("User is not a student");
        }

        // Check if assignment already exists
        Optional<MentorAssignment> existing = mentorAssignmentRepository
                .findByMentorIdAndStudentId(mentorId, studentId);

        if (existing.isPresent()) {
            MentorAssignment assignment = existing.get();
            // If inactive, reactivate it
            if (assignment.getStatus() != AssignmentStatus.ACTIVE) {
                assignment.setStatus(AssignmentStatus.ACTIVE);
                return mentorAssignmentRepository.save(assignment);
            }
            return assignment; // Already active
        }

        // Deactivate any existing active mentor for this student
        Optional<MentorAssignment> currentMentor = mentorAssignmentRepository
                .findActiveMentorForStudent(studentId);
        currentMentor.ifPresent(ma -> {
            ma.setStatus(AssignmentStatus.INACTIVE);
            mentorAssignmentRepository.save(ma);
        });

        // Create new assignment
        User createdBy = userRepository.findById(createdById).orElse(mentor);
        MentorAssignment assignment = new MentorAssignment(mentor, student, createdBy);
        return mentorAssignmentRepository.save(assignment);
    }

    /**
     * Get all active students for a mentor
     */
    public List<User> getActiveStudentsForMentor(Long mentorId) {
        return mentorAssignmentRepository.findActiveStudentsByMentorId(mentorId)
                .stream()
                .map(MentorAssignment::getStudent)
                .collect(Collectors.toList());
    }

    /**
     * Get active mentor for a student
     */
    public Optional<User> getActiveMentorForStudent(Long studentId) {
        return mentorAssignmentRepository.findActiveMentorForStudent(studentId)
                .map(MentorAssignment::getMentor);
    }

    /**
     * Get all assignments for a mentor
     */
    public List<MentorAssignment> getAllAssignmentsForMentor(Long mentorId) {
        return mentorAssignmentRepository.findByMentorId(mentorId);
    }

    /**
     * Remove student from mentor (set to INACTIVE)
     */
    @Transactional
    public void removeStudentFromMentor(Long mentorId, Long studentId) {
        Optional<MentorAssignment> assignment = mentorAssignmentRepository
                .findByMentorIdAndStudentId(mentorId, studentId);

        assignment.ifPresent(ma -> {
            ma.setStatus(AssignmentStatus.INACTIVE);
            mentorAssignmentRepository.save(ma);
        });
    }

    /**
     * Permanently delete assignment
     */
    @Transactional
    public void deleteAssignment(Long mentorId, Long studentId) {
        mentorAssignmentRepository.deleteByMentorIdAndStudentId(mentorId, studentId);
    }

    /**
     * Get count of active students for a mentor
     */
    public long getActiveStudentCount(Long mentorId) {
        return mentorAssignmentRepository.countActiveStudentsByMentorId(mentorId);
    }

    /**
     * Get all students (for searching/assigning)
     */
    public List<User> getAllStudents() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "STUDENT".equals(u.getRole().getName()))
                .collect(Collectors.toList());
    }

    /**
     * Get students not yet assigned to a specific mentor
     */
    public List<User> getUnassignedStudentsForMentor(Long mentorId) {
        List<User> allStudents = getAllStudents();
        List<User> assignedStudents = getActiveStudentsForMentor(mentorId);

        allStudents.removeAll(assignedStudents);
        return allStudents;
    }

    /**
     * Bulk assign multiple students to a mentor
     */
    @Transactional
    public List<MentorAssignment> bulkAssignStudents(Long mentorId, List<Long> studentIds, Long createdById) {
        return studentIds.stream()
                .map(studentId -> assignStudentToMentor(mentorId, studentId, createdById))
                .collect(Collectors.toList());
    }
}
