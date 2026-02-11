package com.eduflex.backend.service;

import com.eduflex.backend.model.*;
import com.eduflex.backend.model.MentorAssignment.AssignmentStatus;
import com.eduflex.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
public class MentorService {

    @Autowired
    private MentorAssignmentRepository mentorAssignmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClassGroupRepository classGroupRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private CourseResultRepository courseResultRepository;

    @Autowired
    private ClassWellbeingSurveyRepository wellbeingSurveyRepository;

    @Autowired
    private MessageRepository messageRepository;

    /**
     * Get a comprehensive overview of the class assigned to this mentor
     */
    public Map<String, Object> getClassOverview(Long mentorId) {
        ClassGroup classGroup = classGroupRepository.findByMentor_Id(mentorId)
                .orElseThrow(() -> new IllegalArgumentException("No class assigned to this mentor"));

        List<User> students = userRepository.findByClassGroup_Id(classGroup.getId());

        Map<String, Object> overview = new HashMap<>();
        overview.put("className", classGroup.getName());
        overview.put("studentCount", students.size());

        // 1. Attendance Today
        double avgAttendance = students.stream()
                .mapToDouble(s -> calculateAttendanceRate(s.getId()))
                .average().orElse(100.0);
        overview.put("attendanceToday", Math.round(avgAttendance) + "%");

        // 2. Wellbeing Index
        Double avgWellbeing = wellbeingSurveyRepository.getAverageRatingByClassGroupId(classGroup.getId());
        overview.put("wellbeingIndex", avgWellbeing != null ? Math.round(avgWellbeing * 20) : 0); // Scale to 100%
        overview.put("avgWellbeing", avgWellbeing != null ? avgWellbeing : 0.0);

        // 3. Risk Students
        List<Map<String, Object>> riskStudents = new ArrayList<>();
        for (User student : students) {
            int riskScore = calculateRiskScore(student);
            if (riskScore >= 2) {
                Map<String, Object> rs = new HashMap<>();
                rs.put("id", student.getId());
                rs.put("name", student.getFullName());
                rs.put("riskScore", riskScore);
                riskStudents.add(rs);
            }
        }
        overview.put("atRiskCount", riskStudents.size());
        overview.put("riskStudents", riskStudents);

        // 4. Grade Progress
        long gradedCourses = students.stream()
                .flatMap(s -> courseResultRepository.findByStudentId(s.getId()).stream())
                .filter(r -> r.getStatus() == CourseResult.Status.PASSED || r.getStatus() == CourseResult.Status.FAILED)
                .count();
        overview.put("gradeStatus", gradedCourses > 0 ? "Aktiv" : "Inga betyg ännu");

        // 5. Contact Needs
        long unreadCount = students.stream()
                .mapToLong(s -> messageRepository.countBySenderIdAndRecipientIdAndIsRead(s.getId(), mentorId, false))
                .sum();
        overview.put("contactNeeds", unreadCount);

        return overview;
    }

    private double calculateAttendanceRate(Long studentId) {
        long total = attendanceRepository.countByStudentId(studentId);
        if (total == 0)
            return 100.0;
        long present = attendanceRepository.countByStudentIdAndIsPresent(studentId, true);
        return (double) present / total * 100.0;
    }

    private int calculateRiskScore(User student) {
        int score = 1;
        double attendance = calculateAttendanceRate(student.getId());
        if (attendance < 90.0)
            score++;
        if (attendance < 75.0)
            score++;

        long fGrades = courseResultRepository.countByStudentIdAndGrade(student.getId(), "F");
        if (fGrades > 0)
            score++;
        if (fGrades > 2)
            score++;

        // Check latest wellbeing survey
        List<ClassWellbeingSurvey> surveys = wellbeingSurveyRepository
                .findByClassGroupIdOrderByCreatedAtDesc(student.getClassGroup().getId());
        Optional<ClassWellbeingSurvey> latest = surveys.stream()
                .filter(s -> s.getStudent().getId().equals(student.getId())).findFirst();
        if (latest.isPresent() && latest.get().getRating() < 3)
            score++;

        return Math.min(score, 5);
    }

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

    public List<Map<String, Object>> getPupilsInClass(Long mentorId) {
        ClassGroup classGroup = classGroupRepository.findByMentor_Id(mentorId)
                .orElseThrow(() -> new IllegalArgumentException("No class assigned to this mentor"));

        List<User> students = userRepository.findByClassGroup_Id(classGroup.getId());
        List<Map<String, Object>> result = new ArrayList<>();

        for (User pupil : students) {
            Map<String, Object> p = new HashMap<>();
            p.put("id", pupil.getId());
            p.put("name", pupil.getFullName());
            p.put("photo", pupil.getProfilePictureUrl());
            p.put("attendance", calculateAttendanceRate(pupil.getId()));
            p.put("riskScore", calculateRiskScore(pupil));

            // Count passed courses vs total assigned
            List<CourseResult> results = courseResultRepository.findByStudentId(pupil.getId());
            long passed = results.stream().filter(r -> r.getStatus() == CourseResult.Status.PASSED).count();
            p.put("grades", passed + "/" + (pupil.getCourses() != null ? pupil.getCourses().size() : 0));

            // Wellbeing (latest rating)
            List<ClassWellbeingSurvey> surveys = wellbeingSurveyRepository
                    .findByClassGroupIdOrderByCreatedAtDesc(classGroup.getId());
            Optional<ClassWellbeingSurvey> latest = surveys.stream()
                    .filter(s -> s.getStudent().getId().equals(pupil.getId())).findFirst();
            p.put("wellbeing", latest.isPresent() ? latest.get().getRating() : 0);

            result.add(p);
        }
        return result;
    }
}
