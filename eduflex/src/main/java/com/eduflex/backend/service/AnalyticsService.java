package com.eduflex.backend.service;

import com.eduflex.backend.dto.AnalyticsDTO;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.Document;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.DocumentRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final DocumentRepository documentRepository; // <--- NYTT

    public AnalyticsService(UserRepository userRepository, CourseRepository courseRepository, DocumentRepository documentRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.documentRepository = documentRepository;
    }

    public AnalyticsDTO getSystemOverview() {
        List<User> allUsers = userRepository.findAll();
        List<Course> allCourses = courseRepository.findAll();
        List<Document> allDocs = documentRepository.findAll(); // Hämta alla filer

        // --- GRUNDDATA ---
        long totalUsers = allUsers.size();
        long totalStudents = allUsers.stream().filter(u -> u.getRole() == User.Role.STUDENT).count();
        long totalTeachers = allUsers.stream().filter(u -> u.getRole() == User.Role.TEACHER).count();
        long totalCourses = allCourses.size();

        // --- AKTIVITET ---
        LocalDateTime limitDate = LocalDateTime.now().minusDays(30);
        long activeUsers = allUsers.stream()
                .filter(u -> u.getLastLogin() != null && u.getLastLogin().isAfter(limitDate))
                .count();

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        long activeToday = allUsers.stream()
                .filter(u -> u.getLastLogin() != null && u.getLastLogin().isAfter(startOfToday))
                .count();

        double avgLogins = totalUsers > 0
                ? allUsers.stream().mapToInt(User::getLoginCount).average().orElse(0.0)
                : 0.0;
        avgLogins = Math.round(avgLogins * 10.0) / 10.0;

        // --- LAGRING & FILER ---
        long totalStorage = allDocs.stream().mapToLong(Document::getSize).sum();

        // Gruppera filer på typ (Image, PDF, Other)
        Map<String, Long> fileTypes = allDocs.stream()
                .collect(Collectors.groupingBy(doc -> {
                    String type = doc.getFileType();
                    if (type == null) return "Okänd";
                    if (type.contains("image")) return "Bilder";
                    if (type.contains("pdf")) return "PDF";
                    if (type.contains("word") || type.contains("document")) return "Word/Dokument";
                    return "Övrigt";
                }, Collectors.counting()));

        // --- TILLVÄXT (Users by Month) ---
        // Använd createdAt om det finns, annars "Okänd"
        Map<String, Long> growthMap = new TreeMap<>(); // TreeMap håller ordning
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (User u : allUsers) {
            String month = u.getCreatedAt() != null ? u.getCreatedAt().format(formatter) : "Tidigare";
            growthMap.put(month, growthMap.getOrDefault(month, 0L) + 1);
        }

        // --- KURSKATEGORIER ---
        Map<String, Long> categoryMap = allCourses.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getCategory() != null && !c.getCategory().isEmpty() ? c.getCategory() : "Okategoriserad",
                        Collectors.counting()
                ));

        // --- TOPPLISTA KURSER ---
        List<AnalyticsDTO.CourseStat> courseStats = allCourses.stream()
                .map(course -> new AnalyticsDTO.CourseStat(
                        course.getName(),
                        course.getStudents().size()
                ))
                .sorted((a, b) -> Long.compare(b.students(), a.students()))
                .limit(8)
                .collect(Collectors.toList());

        // --- TOPPLISTA ANVÄNDARE ---
        List<AnalyticsDTO.UserActivityStat> topUsers = allUsers.stream()
                .sorted((a, b) -> Integer.compare(b.getLoginCount(), a.getLoginCount()))
                .limit(5)
                .map(u -> new AnalyticsDTO.UserActivityStat(u.getFullName(), u.getRole().name(), u.getLoginCount()))
                .collect(Collectors.toList());

        return new AnalyticsDTO(
                totalUsers, totalStudents, totalTeachers, totalCourses,
                activeUsers, activeToday, avgLogins,
                totalStorage,
                growthMap,
                fileTypes,
                categoryMap,
                courseStats,
                topUsers
        );
    }
}