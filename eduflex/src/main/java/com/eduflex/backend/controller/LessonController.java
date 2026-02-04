package com.eduflex.backend.controller;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.Lesson;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.LessonRepository;
import com.eduflex.backend.service.StorageService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@CrossOrigin(origins = "*")
public class LessonController {

    private final LessonRepository lessonRepo;
    private final CourseRepository courseRepo;
    private final com.eduflex.backend.repository.UserRepository userRepo; // <--- NY
    private final StorageService storageService;

    public LessonController(LessonRepository lessonRepo, CourseRepository courseRepo,
            com.eduflex.backend.repository.UserRepository userRepo, StorageService storageService) {
        this.lessonRepo = lessonRepo;
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
        this.storageService = storageService;
    }

    @GetMapping("/course/{courseId}")
    public List<Lesson> getLessons(@PathVariable Long courseId) {
        return lessonRepo.findByCourseIdOrderBySortOrderAsc(courseId);
    }

    // Skapa lektion (med valfri fil)
    @PostMapping("/course/{courseId}")
    public Lesson createLesson(
            @PathVariable Long courseId,
            @RequestParam Long userId, // <--- NY PARAM
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "videoUrl", required = false) String videoUrl,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        Course course = courseRepo.findById(courseId).orElseThrow();
        com.eduflex.backend.model.User author = userRepo.findById(userId).orElseThrow(); // <--- HÄMTA AUTHOR

        Lesson lesson = new Lesson();
        lesson.setTitle(title);
        lesson.setContent(content);
        lesson.setVideoUrl(videoUrl);
        lesson.setCourse(course);
        lesson.setAuthor(author); // <--- SÄTT AUTHOR

        // Sätt sist i ordningen
        List<Lesson> existing = lessonRepo.findByCourseIdOrderBySortOrderAsc(courseId);
        lesson.setSortOrder(existing.size() + 1);

        if (file != null && !file.isEmpty()) {
            String storageId = storageService.save(file);
            String path = "/api/storage/" + storageId;
            lesson.setAttachmentUrl(path);
            lesson.setAttachmentName(file.getOriginalFilename());
        }

        return lessonRepo.save(lesson);
    }

    // NY ENDPOINT: Skapa fristående lektion
    @PostMapping("/create")
    public Lesson createGlobalLesson(
            @RequestParam Long userId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "videoUrl", required = false) String videoUrl,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        com.eduflex.backend.model.User author = userRepo.findById(userId).orElseThrow();

        Lesson lesson = new Lesson();
        lesson.setTitle(title);
        lesson.setContent(content);
        lesson.setVideoUrl(videoUrl);
        lesson.setAuthor(author);
        lesson.setSortOrder(0);

        if (file != null && !file.isEmpty()) {
            String storageId = storageService.save(file);
            String path = "/api/storage/" + storageId;
            lesson.setAttachmentUrl(path);
            lesson.setAttachmentName(file.getOriginalFilename());
        }

        return lessonRepo.save(lesson);
    }

    @GetMapping("/my")
    public List<Lesson> getMyLessons(@RequestParam Long userId) {
        return lessonRepo.findByAuthorId(userId);
    }

    @GetMapping("/{id}")
    public Lesson getLesson(@PathVariable Long id) {
        return lessonRepo.findById(id).orElseThrow(() -> new RuntimeException("Lesson not found"));
    }

    // Uppdatera lektion
    @PutMapping("/{id}")
    public Lesson updateLesson(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "videoUrl", required = false) String videoUrl,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        Lesson lesson = lessonRepo.findById(id).orElseThrow();
        lesson.setTitle(title);
        lesson.setContent(content);
        lesson.setVideoUrl(videoUrl);

        if (file != null && !file.isEmpty()) {
            String storageId = storageService.save(file);
            String path = "/api/storage/" + storageId;
            lesson.setAttachmentUrl(path);
            lesson.setAttachmentName(file.getOriginalFilename());
        }

        return lessonRepo.save(lesson);
    }

    @DeleteMapping("/{id}")
    public void deleteLesson(@PathVariable Long id) {
        lessonRepo.deleteById(id);
    }
}