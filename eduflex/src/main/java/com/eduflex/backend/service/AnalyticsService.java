package com.eduflex.backend.service;

import com.eduflex.backend.model.Assignment;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.Quiz;
import com.eduflex.backend.model.QuizResult;
import com.eduflex.backend.model.Submission;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.AssignmentRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.QuizRepository;
import com.eduflex.backend.repository.QuizResultRepository;
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
        private final QuizRepository quizRepository;
        private final QuizResultRepository quizResultRepository;

        public AnalyticsService(UserRepository userRepository, CourseRepository courseRepository,
                        AssignmentRepository assignmentRepository, SubmissionRepository submissionRepository,
                        QuizRepository quizRepository, QuizResultRepository quizResultRepository) {
                this.userRepository = userRepository;
                this.courseRepository = courseRepository;
                this.assignmentRepository = assignmentRepository;
                this.submissionRepository = submissionRepository;
                this.quizRepository = quizRepository;
                this.quizResultRepository = quizResultRepository;
        }

        public Map<String, Object> getSystemOverview(String range) {
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

        public List<Map<String, Object>> getUserGrowth(String range) {
                List<User> users = userRepository.findAll();

                switch (range) {
                        case "day":
                                return generateHourlyData(users);
                        case "week":
                                return generateDailyData(users, 7);
                        case "month":
                                return generateDailyData(users, 30);
                        case "year":
                        default:
                                return generateMonthlyData(users);
                }
        }

        private List<Map<String, Object>> generateHourlyData(List<User> users) {
                List<Map<String, Object>> growth = new ArrayList<>();
                LocalDateTime now = LocalDateTime.now();

                // Last 24 hours - show hourly breakdown
                for (int i = 23; i >= 0; i--) {
                        LocalDateTime hour = now.minusHours(i);
                        Map<String, Object> point = new HashMap<>();
                        point.put("name", String.format("%02d:00", hour.getHour()));

                        // Count users created/active in this hour (simplified - using total users as
                        // baseline)
                        long count = users.size() / 24 + (i == 0 ? users.size() % 24 : 0);
                        point.put("users", count);
                        point.put("revenue", count * 99);
                        growth.add(point);
                }
                return growth;
        }

        private List<Map<String, Object>> generateDailyData(List<User> users, int days) {
                List<Map<String, Object>> growth = new ArrayList<>();
                LocalDateTime now = LocalDateTime.now();

                for (int i = days - 1; i >= 0; i--) {
                        LocalDateTime day = now.minusDays(i);
                        Map<String, Object> point = new HashMap<>();
                        point.put("name", day.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " "
                                        + day.getDayOfMonth());

                        // Count users created up to this day
                        long count = users.stream()
                                        .filter(u -> u.getCreatedAt() != null
                                                        && u.getCreatedAt().isBefore(day.plusDays(1)))
                                        .count();
                        point.put("users", count);
                        point.put("revenue", count * 99);
                        growth.add(point);
                }
                return growth;
        }

        private List<Map<String, Object>> generateMonthlyData(List<User> users) {
                // Original monthly logic
                Map<Month, Long> growthMap = users.stream()
                                .filter(u -> u.getCreatedAt() != null)
                                .collect(Collectors.groupingBy(
                                                u -> u.getCreatedAt().getMonth(),
                                                Collectors.counting()));

                List<Map<String, Object>> growth = new ArrayList<>();
                long cumulative = 0;
                for (Month m : Month.values()) {
                        Map<String, Object> point = new HashMap<>();
                        point.put("name", m.getDisplayName(TextStyle.SHORT, Locale.ENGLISH));

                        long newUsers = growthMap.getOrDefault(m, 0L);
                        cumulative += newUsers;

                        point.put("users", cumulative);
                        point.put("revenue", cumulative * 99);
                        growth.add(point);
                }
                return growth;
        }

        public Map<String, Object> getEngagementStats() {
                List<Course> courses = courseRepository.findAll();
                long totalStudents = courses.stream().mapToLong(c -> c.getStudents().size()).sum();

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
                                "churnRate", churnRisk);

        }

        public List<Map<String, Object>> getCSNReport() {
                // Hämta alla studenter och beräkna "Digital Närvaro"
                List<User> students = userRepository.findAll().stream()
                                .filter(u -> "STUDENT".equals(u.getRole().getName()))
                                .collect(Collectors.toList());

                return students.stream().map(student -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", student.getId());
                        map.put("name", student.getFullName());
                        map.put("personnummer", "19900101-1234"); // Mockat då vi saknar fältet just nu

                        // Aktivitet senaste 30 dagarna
                        // LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

                        // Hämta kurser
                        // List<Course> courses = new ArrayList<>(student.getCourses());

                        // Loggad tid (baserat på activity logs + inloggningar)
                        // Vi gör en approximation: Varje unikt datum med aktivitet = 4h studier
                        // Detta är en förenkling för CSN-rappertering i MVP

                        // TODO: Implementera mer exakt logik med timestamps från activityLogRepository
                        // long activeDays = 0; // Placeholder

                        // Mockad logik för demonstration:
                        long loginCountLast30 = student.getLoginCount(); // Förenkling
                        double attendancePercent = Math.min(100, (loginCountLast30 * 5)); // 20 inloggningar = 100%

                        map.put("attendancePercent", attendancePercent);
                        map.put("status", attendancePercent < 50 ? "Not Eligible" : "Eligible");
                        map.put("comment", attendancePercent < 50 ? "För låg aktivitet" : "Godkänd");

                        return map;
                }).collect(Collectors.toList());
        }

        public Map<String, Object> getStudentSelfStatus(Long studentId) {
                User student = userRepository.findById(studentId).orElseThrow();

                // Hämta insikter för denna student (återanvänder logik från getStudentInsights)
                // Enklast att anropa getStudentInsights och filtrera (ineffektivt men säkert
                // för MVP)
                // Bättre: Extrahera logiken.

                // Göra en snabbkalkyl här:
                Map<String, Object> status = new HashMap<>();

                int loginScore = Math.min(100, student.getLoginCount() * 2);

                // Risk factor
                String risk = "Low";
                if (student.getLastLogin() == null
                                || student.getLastLogin().isBefore(LocalDateTime.now().minusDays(7))) {
                        risk = "Medium";
                }
                if (student.getLastLogin() != null
                                && student.getLastLogin().isBefore(LocalDateTime.now().minusDays(30))) {
                        risk = "High";
                }

                status.put("healthScore", loginScore); // 0-100
                status.put("riskLevel", risk); // Low, Medium, High

                // Real time calculation
                double hours = (student.getActiveMinutes() != null ? student.getActiveMinutes() : 0) / 60.0;
                // Round to 1 decimal
                hours = Math.round(hours * 10.0) / 10.0;

                status.put("hoursLogged", hours);
                status.put("expectedHours", 40); // Mockat mål

                return status;
        }

        public List<Map<String, Object>> getStudentInsights() {
                // ... existing code ...
                List<User> students = userRepository.findAll().stream()
                                .filter(u -> "STUDENT".equals(u.getRole().getName()))
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

        public List<Map<String, Object>> getStudentCourseProgress(Long studentId) {
                User student = userRepository.findById(studentId)
                                .orElseThrow(() -> new RuntimeException("Student not found"));

                Set<Course> courses = student.getCourses();
                if (courses == null || courses.isEmpty()) {
                        return new ArrayList<>();
                }

                return courses.stream().map(course -> {
                        Map<String, Object> progress = new HashMap<>();
                        progress.put("courseId", course.getId());
                        progress.put("courseName", course.getName());

                        // Get assignments for this course
                        List<Assignment> courseAssignments = assignmentRepository.findAll().stream()
                                        .filter(a -> a.getCourse() != null && a.getCourse().getId().equals(course.getId()))
                                        .collect(Collectors.toList());

                        // Get student's submissions for this course
                        List<Submission> studentSubmissions = submissionRepository
                                        .findByStudentIdAndAssignmentCourseId(studentId, course.getId());

                        int totalAssignments = courseAssignments.size();
                        int completedAssignments = studentSubmissions.size();

                        progress.put("totalAssignments", totalAssignments);
                        progress.put("completedAssignments", completedAssignments);

                        // Get quizzes for this course
                        List<Quiz> courseQuizzes = quizRepository.findByCourseId(course.getId());

                        // Get student's quiz results for this course
                        List<QuizResult> studentQuizResults = quizResultRepository
                                        .findByStudentIdAndQuizCourseId(studentId, course.getId());

                        int totalQuizzes = courseQuizzes.size();
                        int completedQuizzes = studentQuizResults.size();

                        progress.put("totalQuizzes", totalQuizzes);
                        progress.put("completedQuizzes", completedQuizzes);

                        // Calculate risk and estimated grade
                        boolean isAtRisk = false;
                        String riskReason = null;

                        // Check for overdue assignments
                        long overdueCount = courseAssignments.stream()
                                        .filter(a -> a.getDueDate() != null && a.getDueDate().isBefore(LocalDateTime.now()))
                                        .filter(a -> studentSubmissions.stream()
                                                        .noneMatch(s -> s.getAssignment().getId().equals(a.getId())))
                                        .count();

                        if (overdueCount > 0) {
                                isAtRisk = true;
                                riskReason = overdueCount + " försenade uppgifter";
                        } else if (totalAssignments > 0 && completedAssignments < totalAssignments * 0.5) {
                                isAtRisk = true;
                                riskReason = "Mindre än 50% av uppgifterna gjorda";
                        }

                        progress.put("isAtRisk", isAtRisk);
                        progress.put("riskReason", riskReason);

                        // Calculate estimated grade based on graded submissions
                        String estimatedGrade = calculateEstimatedGrade(studentSubmissions, studentQuizResults);
                        progress.put("estimatedGrade", estimatedGrade);

                        // Get recent results (assignments and quizzes)
                        List<Map<String, Object>> recentResults = new ArrayList<>();

                        // Add graded submissions
                        studentSubmissions.stream()
                                        .filter(s -> s.getGrade() != null && !s.getGrade().isEmpty())
                                        .sorted((a, b) -> {
                                                if (a.getSubmittedAt() == null) return 1;
                                                if (b.getSubmittedAt() == null) return -1;
                                                return b.getSubmittedAt().compareTo(a.getSubmittedAt());
                                        })
                                        .limit(5)
                                        .forEach(s -> {
                                                Map<String, Object> result = new HashMap<>();
                                                result.put("title", s.getAssignment().getTitle());
                                                result.put("type", "Uppgift");
                                                result.put("scoreOrGrade", s.getGrade());
                                                recentResults.add(result);
                                        });

                        // Add quiz results
                        studentQuizResults.stream()
                                        .sorted((a, b) -> {
                                                if (a.getDate() == null) return 1;
                                                if (b.getDate() == null) return -1;
                                                return b.getDate().compareTo(a.getDate());
                                        })
                                        .limit(5)
                                        .forEach(qr -> {
                                                Map<String, Object> result = new HashMap<>();
                                                result.put("title", qr.getQuiz().getTitle());
                                                result.put("type", "Quiz");
                                                result.put("scoreOrGrade", qr.getScore() + "/" + qr.getMaxScore());
                                                recentResults.add(result);
                                        });

                        progress.put("recentResults", recentResults);

                        return progress;
                }).collect(Collectors.toList());
        }

        private String calculateEstimatedGrade(List<Submission> submissions, List<QuizResult> quizResults) {
                // Swedish grading: F, E, D, C, B, A
                List<String> grades = submissions.stream()
                                .map(Submission::getGrade)
                                .filter(g -> g != null && !g.isEmpty())
                                .collect(Collectors.toList());

                if (grades.isEmpty() && quizResults.isEmpty()) {
                        return "N/A";
                }

                // Calculate average from quiz scores
                double quizAvg = quizResults.stream()
                                .filter(qr -> qr.getMaxScore() > 0)
                                .mapToDouble(qr -> (double) qr.getScore() / qr.getMaxScore() * 100)
                                .average()
                                .orElse(-1);

                // Convert letter grades to numeric for averaging
                double gradeAvg = grades.stream()
                                .mapToDouble(this::gradeToNumeric)
                                .filter(g -> g >= 0)
                                .average()
                                .orElse(-1);

                // Combine averages
                double combined;
                if (quizAvg >= 0 && gradeAvg >= 0) {
                        combined = (quizAvg + gradeAvg) / 2;
                } else if (quizAvg >= 0) {
                        combined = quizAvg;
                } else if (gradeAvg >= 0) {
                        combined = gradeAvg;
                } else {
                        return "N/A";
                }

                return numericToGrade(combined);
        }

        private double gradeToNumeric(String grade) {
                if (grade == null) return -1;
                switch (grade.toUpperCase()) {
                        case "A": return 100;
                        case "B": return 85;
                        case "C": return 70;
                        case "D": return 55;
                        case "E": return 40;
                        case "F": return 20;
                        default: return -1;
                }
        }

        private String numericToGrade(double score) {
                if (score >= 90) return "A";
                if (score >= 75) return "B";
                if (score >= 60) return "C";
                if (score >= 45) return "D";
                if (score >= 30) return "E";
                return "F";
        }
}
