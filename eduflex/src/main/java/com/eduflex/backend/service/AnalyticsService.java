package com.eduflex.backend.service;

import com.eduflex.backend.model.Assignment;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.Submission;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.AssignmentRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.SubmissionRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

        private final UserRepository userRepository;
        private final CourseRepository courseRepository;
        private final AssignmentRepository assignmentRepository;
        private final SubmissionRepository submissionRepository;

        public AnalyticsService(UserRepository userRepository, CourseRepository courseRepository,
                        AssignmentRepository assignmentRepository, SubmissionRepository submissionRepository) {
                this.userRepository = userRepository;
                this.courseRepository = courseRepository;
                this.assignmentRepository = assignmentRepository;
                this.submissionRepository = submissionRepository;
        }

        public Map<String, Object> getSystemOverview() {
                Map<String, Object> data = new HashMap<>();
                long userCount = userRepository.count();
                long courseCount = courseRepository.count();

                // Active sessions (Login within last 30 min)
                long activeSessions = userRepository.findAll().stream()
                                .filter(u -> u.getLastLogin() != null
                                                && u.getLastLogin().isAfter(LocalDateTime.now().minusMinutes(30)))
                                .count();

                // Financials (Still projected based on users, as we have no payment gateway)
                double mrr = userCount * 99.0;

                data.put("totalUsers", userCount);
                data.put("totalCourses", courseCount);
                data.put("mrr", mrr);
                data.put("arr", mrr * 12);
                data.put("serverHealth", "Operational");
                data.put("activeSessions", activeSessions);

                return data;
        }

        public List<Map<String, Object>> getUserGrowth() {
                List<User> users = userRepository.findAll();

                // Group by Month of Creation
                Map<Month, Long> growthMap = users.stream()
                                .filter(u -> u.getCreatedAt() != null)
                                .collect(Collectors.groupingBy(
                                                u -> u.getCreatedAt().getMonth(),
                                                Collectors.counting()));

                List<Map<String, Object>> growth = new ArrayList<>();

                // Iterate months Jan-Dec
                long cumulative = 0;
                for (Month m : Month.values()) {
                        Map<String, Object> point = new HashMap<>();
                        point.put("name", m.getDisplayName(TextStyle.SHORT, Locale.ENGLISH));

                        long newUsers = growthMap.getOrDefault(m, 0L);
                        cumulative += newUsers;

                        point.put("users", cumulative);
                        point.put("revenue", cumulative * 99);
                        growth.add(point);

                        // Stop if future month relative to now? Optional, but let's show full year
                        // context.
                }
                return growth;
        }

        public Map<String, Object> getEngagementStats() {
                List<Course> courses = courseRepository.findAll();
                long totalStudents = courses.stream().mapToLong(c -> c.getStudents().size()).sum();

                // Submissions vs Assignments
                long totalAssignments = assignmentRepository.count();
                long totalSubmissions = submissionRepository.count();

                int globalCompletionRate = 0;
                if (totalAssignments > 0 && totalSubmissions > 0) {
                        // This is a rough heuristic. Ideally: Sum of (StudentSubmissions /
                        // CourseAssignments)
                        // But simplistic: Global Submissions / (Students * AvgAssignmentsPerCourse ?
                        // No)
                        // Let's stick to a simpler metric: % of users who have logged in this week.
                        long activeUsers = userRepository.findAll().stream()
                                        .filter(u -> u.getLastLogin() != null
                                                        && u.getLastLogin().isAfter(LocalDateTime.now().minusDays(7)))
                                        .count();

                        // Churn: Inactive > 30 days
                        long churnRisk = userRepository.findAll().stream()
                                        .filter(u -> u.getLastLogin() != null
                                                        && u.getLastLogin().isBefore(LocalDateTime.now().minusDays(30)))
                                        .count();

                        // Completion Rate
                        // Let's use getStudentInsights logic aggregation
                        double avgCompletion = getStudentInsights().stream()
                                        .mapToInt(m -> Integer
                                                        .parseInt(m.get("completionRate").toString().replace("%", "")))
                                        .average().orElse(0);

                        return Map.of(
                                        "totalEnrollments", totalStudents,
                                        "avgStudentsPerCourse", courses.isEmpty() ? 0 : totalStudents / courses.size(),
                                        "completionRate", (int) avgCompletion + "%",
                                        "churnRate", churnRisk // Raw count of at-risk users
                        );
                }

                return Map.of(
                                "totalEnrollments", totalStudents,
                                "avgStudentsPerCourse", courses.isEmpty() ? 0 : totalStudents / courses.size(),
                                "completionRate", "0%",
                                "churnRate", 0);
        }

        public List<Map<String, Object>> getStudentInsights() {
                List<User> students = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == User.Role.STUDENT)
                                .collect(Collectors.toList());

                List<Assignment> allAssignments = assignmentRepository.findAll();
                List<Submission> allSubmissions = submissionRepository.findAll();

                return students.stream().map(student -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", student.getId());
                        map.put("name", student.getFullName());
                        map.put("email", student.getEmail());
                        map.put("lastLogin", student.getLastLogin());
                        map.put("loginCount", student.getLoginCount());
                        map.put("totalTimeOnline", student.getLoginCount() * 20); // Estimation 20 min/session
                        map.put("coursesEnrolled", student.getCourses().size());

                        // Real Completion Rate
                        // 1. Find all courses student is in.
                        // 2. Count total assignments in those courses.
                        // 3. Count submissions by student in those courses.

                        long studentAssignmentCount = allAssignments.stream()
                                        .filter(a -> student.getCourses().contains(a.getCourse())) // Assuming
                                                                                                   // bidirectional/equals
                                                                                                   // works or ID check
                                        .count();

                        long studentSubmissionCount = allSubmissions.stream()
                                        .filter(s -> s.getStudent().getId().equals(student.getId()))
                                        .count();

                        int completion = 0;
                        if (studentAssignmentCount > 0) {
                                completion = (int) ((double) studentSubmissionCount / studentAssignmentCount * 100);
                        } else if (student.getCourses().isEmpty()) {
                                completion = 0; // No courses
                        } else {
                                completion = 100; // Courses have no assignments yet
                        }
                        if (completion > 100)
                                completion = 100;

                        map.put("completionRate", completion + "%");

                        // Risk Logic
                        String risk = "Low";
                        if (student.getLastLogin() == null
                                        || student.getLastLogin().isBefore(LocalDateTime.now().minusDays(14)))
                                risk = "Medium";
                        if (student.getLastLogin() != null
                                        && student.getLastLogin().isBefore(LocalDateTime.now().minusDays(30)))
                                risk = "High";
                        if (completion < 20 && studentAssignmentCount > 0)
                                risk = "High";

                        map.put("status", risk.equals("High") ? "At Risk" : "Active");
                        map.put("riskFactor", risk);

                        return map;
                }).collect(Collectors.toList());
        }
}
