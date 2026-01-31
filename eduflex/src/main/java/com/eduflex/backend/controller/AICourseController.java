package com.eduflex.backend.controller;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CourseMaterial;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseMaterialRepository;
import com.eduflex.backend.repository.CourseRepository;
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
    private final CourseMaterialRepository materialRepository;
    private final UserService userService;
    private final ObjectMapper objectMapper;
    private final Tika tika = new Tika();

    public AICourseController(GeminiService geminiService, CourseRepository courseRepository,
            CourseMaterialRepository materialRepository, UserService userService, ObjectMapper objectMapper) {
        logger.info("AICourseController INITIALIZED");
        this.geminiService = geminiService;
        this.courseRepository = courseRepository;
        this.materialRepository = materialRepository;
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
    }

    @PostMapping("/generate-preview")
    public ResponseEntity<?> generatePreview(@RequestParam("file") MultipartFile file) {
        try {
            logger.info("Received request to generate course from file: {}", file.getOriginalFilename());

            String text = tika.parseToString(file.getInputStream());

            if (text == null || text.isBlank()) {
                return ResponseEntity.badRequest().body("Could not extract text from file.");
            }

            if (text.length() > 100000) {
                text = text.substring(0, 100000);
            }

            logger.info("Extracted {} characters. Calling Gemini...", text.length());
            String jsonResponse = geminiService.generateCourseStructure(text);

            JsonNode root = objectMapper.readTree(jsonResponse);

            return ResponseEntity.ok(root);

        } catch (IOException e) {
            logger.error("File processing failed", e);
            return ResponseEntity.status(500).body("Error processing file: " + e.getMessage());
        } catch (Exception e) {
            logger.error("AI generation failed", e);
            return ResponseEntity.status(500).body("AI generation failed: " + e.getMessage());
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createCourse(@RequestBody JsonNode courseData) {
        try {
            if (courseData == null || !courseData.has("title")) {
                return ResponseEntity.badRequest().body("Course data must include a title.");
            }

            logger.info("Creating course from AI data: {}", courseData.get("title").asText());

            User currentUser = getCurrentUser();

            Course course = new Course();
            course.setName(courseData.get("title").asText());
            course.setDescription(courseData.has("description") ? courseData.get("description").asText() : "");
            course.setStartDate(courseData.has("startDate") ? courseData.get("startDate").asText() : "");
            course.setEndDate(courseData.has("endDate") ? courseData.get("endDate").asText() : "");
            course.setTeacher(currentUser);
            course.setOpen(true);

            String baseSlug = course.getName().toLowerCase().replaceAll("[^a-z0-9]", "-");
            course.setSlug(baseSlug + "-" + System.currentTimeMillis());
            course.setCourseCode(generateCourseCode(course.getName()));

            Course savedCourse = courseRepository.save(course);

            // Create materials
            int sortOrder = 0;
            if (courseData.has("modules") && courseData.get("modules").isArray()) {
                for (JsonNode moduleNode : courseData.get("modules")) {
                    String moduleTitle = moduleNode.has("title") ? moduleNode.get("title").asText() : "Modul";

                    if (moduleNode.has("lessons") && moduleNode.get("lessons").isArray()) {
                        for (JsonNode lessonNode : moduleNode.get("lessons")) {
                            CourseMaterial material = new CourseMaterial();
                            String lessonTitle = lessonNode.has("title") ? lessonNode.get("title").asText() : "Lektion";

                            material.setTitle(moduleTitle + ": " + lessonTitle);
                            material.setContent(lessonNode.has("content") ? lessonNode.get("content").asText() : "");
                            material.setCourse(savedCourse);
                            material.setSortOrder(sortOrder++);

                            boolean isQuiz = lessonNode.has("isQuiz") && lessonNode.get("isQuiz").asBoolean();
                            material.setType(isQuiz ? CourseMaterial.MaterialType.QUESTIONS
                                    : CourseMaterial.MaterialType.LESSON);

                            if (isQuiz && lessonNode.has("questions") && lessonNode.get("questions").isArray()) {
                                StringBuilder quizContent = new StringBuilder(material.getContent());
                                if (quizContent.length() > 0)
                                    quizContent.append("\n\n");
                                quizContent.append("<h3>Quizförslag</h3><ul>");
                                for (JsonNode q : lessonNode.get("questions")) {
                                    quizContent.append("<li><strong>")
                                            .append(q.has("text") ? q.get("text").asText() : "Fråga")
                                            .append("</strong><br/>");
                                    if (q.has("options") && q.get("options").isArray()) {
                                        quizContent.append("Alternativ: ").append(q.get("options").toString());
                                    }
                                    quizContent.append("</li>");
                                }
                                quizContent.append("</ul>");
                                material.setContent(quizContent.toString());
                            }

                            materialRepository.save(material);
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
