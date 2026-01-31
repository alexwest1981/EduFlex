package com.eduflex.backend.controller;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.Lesson;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.LessonRepository;
import com.eduflex.backend.service.UserService;
import com.eduflex.backend.service.ai.GeminiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/api/ai-course")
public class AICourseController {

    private static final Logger logger = LoggerFactory.getLogger(AICourseController.class);

    private final GeminiService geminiService;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final UserService userService;
    private final ObjectMapper objectMapper;
    private final Tika tika = new Tika();

    public AICourseController(GeminiService geminiService, CourseRepository courseRepository,
            LessonRepository lessonRepository, UserService userService, ObjectMapper objectMapper) {
        logger.info("AICourseController INITIALIZED");
        this.geminiService = geminiService;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.userService = userService;
        this.objectMapper = objectMapper;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String username = auth.getName();
        return userService.getUserByUsernameWithBadges(username);
        // Or generic getUser(username) if exist, but this one works.
    }

    @PostMapping("/generate-preview")
    public ResponseEntity<?> generatePreview(@RequestParam("file") MultipartFile file) {
        try {
            logger.info("Received request to generate course from file: {}", file.getOriginalFilename());

            // Limit file size if needed, but Tika handles stream.
            String text = tika.parseToString(file.getInputStream());

            if (text == null || text.isBlank()) {
                return ResponseEntity.badRequest().body("Could not extract text from file.");
            }

            // Simple truncation to avoid huge payload if PDF is massive
            if (text.length() > 100000) {
                text = text.substring(0, 100000);
            }

            logger.info("Extracted {} characters. Calling Gemini...", text.length());
            String jsonResponse = geminiService.generateCourseStructure(text);

            // Validate JSON
            JsonNode root = objectMapper.readTree(jsonResponse);

            return ResponseEntity.ok(root);

        } catch (IOException e) {
            e.printStackTrace(); // DEBUG
            logger.error("File processing failed", e);
            return ResponseEntity.status(500).body("Error processing file: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // DEBUG
            logger.error("AI generation failed", e);
            return ResponseEntity.status(500).body("AI generation failed: " + e.getMessage());
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createCourse(@RequestBody JsonNode courseData) {
        try {
            logger.info("Creating course from AI data: {}",
                    courseData.has("title") ? courseData.get("title").asText() : "No Title");

            User currentUser = getCurrentUser();

            Course course = new Course();
            course.setName(courseData.get("title").asText());
            course.setDescription(courseData.has("description") ? courseData.get("description").asText() : "");
            course.setStartDate(courseData.has("startDate") ? courseData.get("startDate").asText() : "");
            course.setEndDate(courseData.has("endDate") ? courseData.get("endDate").asText() : "");
            course.setTeacher(currentUser);
            course.setOpen(true); // Default to open for AI created courses

            // Generate slug only if needed
            course.setSlug(course.getName().toLowerCase().replace(" ", "-") + "-" + System.currentTimeMillis());
            course.setCourseCode(generateCourseCode(course.getName()));

            Course savedCourse = courseRepository.save(course);

            // Flatten Modules into Lessons
            int sortOrder = 0;
            if (courseData.has("modules")) {
                for (JsonNode moduleNode : courseData.get("modules")) {
                    String moduleTitle = moduleNode.has("title") ? moduleNode.get("title").asText() : "Modul";

                    // Ensure we handle lessons
                    if (moduleNode.has("lessons")) {
                        for (JsonNode lessonNode : moduleNode.get("lessons")) {
                            Lesson lesson = new Lesson();
                            String lessonTitle = lessonNode.has("title") ? lessonNode.get("title").asText() : "Lektion";

                            // Prepend Module Info to make it clear in the flat list
                            lesson.setTitle(moduleTitle + ": " + lessonTitle);
                            lesson.setContent(lessonNode.has("content") ? lessonNode.get("content").asText() : "");
                            lesson.setCourse(savedCourse);
                            lesson.setAuthor(currentUser);
                            lesson.setSortOrder(sortOrder++);

                            // Handling Quiz questions - appending to content for now as we lack Quiz
                            // Service logic here
                            if (lessonNode.has("isQuiz") && lessonNode.get("isQuiz").asBoolean()
                                    && lessonNode.has("questions")) {
                                StringBuilder quizContent = new StringBuilder(lesson.getContent());
                                quizContent.append("\n\n<h3>Quizförslag</h3><ul>");
                                for (JsonNode q : lessonNode.get("questions")) {
                                    quizContent.append("<li><strong>").append(q.get("text").asText())
                                            .append("</strong><br/>");
                                    if (q.has("options")) {
                                        quizContent.append("Alternativ: ").append(q.get("options").toString());
                                    }
                                    quizContent.append("</li>");
                                }
                                quizContent.append("</ul>");
                                lesson.setContent(quizContent.toString());
                            }

                            lessonRepository.save(lesson);
                        }
                    }
                }
            }

            return ResponseEntity.ok(Map.of("id", savedCourse.getId(), "message", "Course created successfully!"));

        } catch (Exception e) {
            logger.error("Failed to save course", e);
            return ResponseEntity.status(500).body("Failed to save course: " + e.getMessage());
        }
    }

    private String generateCourseCode(String name) {
        if (name == null || name.isBlank())
            return "AI-COURSE";

        // Remove common Swedish/English short words
        String cleaned = name.replaceAll("(?i)\\b(och|i|med|på|av|för|and|the|in|with|on|of|for)\\b", "");

        StringBuilder code = new StringBuilder();
        String[] words = cleaned.trim().split("\\s+");

        for (String word : words) {
            if (!word.isEmpty()) {
                code.append(Character.toUpperCase(word.charAt(0)));
                // If the word has multiple letters and the code is still short, maybe add a
                // second letter?
                // But user wanted abbreviation, first letter is usually fine.
            }
        }

        // Add a small random/time suffix to ensure uniqueness but keep it short
        String suffix = Long.toString(System.currentTimeMillis()).substring(10);

        String result = code.toString().trim();
        return result.isEmpty() ? "AI-" + suffix : result + suffix;
    }
}
