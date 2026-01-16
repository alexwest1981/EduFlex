package com.eduflex.backend.controller;

import com.eduflex.backend.model.CalendarEvent;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.Document;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CalendarEventRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.DocumentRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final DocumentRepository documentRepository;
    private final CalendarEventRepository calendarEventRepository;

    public SearchController(UserRepository userRepository,
                            CourseRepository courseRepository,
                            DocumentRepository documentRepository,
                            CalendarEventRepository calendarEventRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.documentRepository = documentRepository;
        this.calendarEventRepository = calendarEventRepository;
    }

    @GetMapping("/global")
    public ResponseEntity<Map<String, Object>> globalSearch(@RequestParam String q) {
        String query = q.toLowerCase().trim();

        if (query.length() < 2) {
            return ResponseEntity.ok(Map.of(
                "users", List.of(),
                "courses", List.of(),
                "documents", List.of(),
                "events", List.of()
            ));
        }

        // Search users
        List<Map<String, Object>> users = userRepository.findAll().stream()
            .filter(u -> matchesQuery(u, query))
            .limit(5)
            .map(this::mapUser)
            .collect(Collectors.toList());

        // Search courses
        List<Map<String, Object>> courses = courseRepository.findAll().stream()
            .filter(c -> c.getName() != null && c.getName().toLowerCase().contains(query))
            .limit(5)
            .map(this::mapCourse)
            .collect(Collectors.toList());

        // Search documents
        List<Map<String, Object>> documents = documentRepository.findAll().stream()
            .filter(d -> d.getFileName() != null && d.getFileName().toLowerCase().contains(query))
            .limit(5)
            .map(this::mapDocument)
            .collect(Collectors.toList());

        // Search calendar events
        List<Map<String, Object>> events = calendarEventRepository.findAll().stream()
            .filter(e -> (e.getTitle() != null && e.getTitle().toLowerCase().contains(query)) ||
                        (e.getDescription() != null && e.getDescription().toLowerCase().contains(query)))
            .limit(5)
            .map(this::mapEvent)
            .collect(Collectors.toList());

        Map<String, Object> results = new HashMap<>();
        results.put("users", users);
        results.put("courses", courses);
        results.put("documents", documents);
        results.put("events", events);

        return ResponseEntity.ok(results);
    }

    private boolean matchesQuery(User user, String query) {
        return (user.getFirstName() != null && user.getFirstName().toLowerCase().contains(query)) ||
               (user.getLastName() != null && user.getLastName().toLowerCase().contains(query)) ||
               (user.getEmail() != null && user.getEmail().toLowerCase().contains(query)) ||
               (user.getUsername() != null && user.getUsername().toLowerCase().contains(query));
    }

    private Map<String, Object> mapUser(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("firstName", user.getFirstName());
        map.put("lastName", user.getLastName());
        map.put("fullName", user.getFullName());
        map.put("email", user.getEmail());
        map.put("profilePictureUrl", user.getProfilePictureUrl());
        return map;
    }

    private Map<String, Object> mapCourse(Course course) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", course.getId());
        map.put("name", course.getName());
        map.put("description", course.getDescription());
        return map;
    }

    private Map<String, Object> mapDocument(Document document) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", document.getId());
        map.put("name", document.getFileName());
        map.put("fileType", document.getFileType());
        return map;
    }

    private Map<String, Object> mapEvent(CalendarEvent event) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", event.getId());
        map.put("title", event.getTitle());
        map.put("startTime", event.getStartTime());
        return map;
    }
}
