package com.eduflex.backend.controller;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.Lesson;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.LessonRepository;
import com.eduflex.backend.service.FileStorageService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@CrossOrigin(origins = "*")
public class LessonController {

    private final LessonRepository lessonRepo;
    private final CourseRepository courseRepo;
    private final FileStorageService fileService;

    public LessonController(LessonRepository lessonRepo, CourseRepository courseRepo, FileStorageService fileService) {
        this.lessonRepo = lessonRepo;
        this.courseRepo = courseRepo;
        this.fileService = fileService;
    }

    @GetMapping("/course/{courseId}")
    public List<Lesson> getLessons(@PathVariable Long courseId) {
        return lessonRepo.findByCourseIdOrderBySortOrderAsc(courseId);
    }

    // Skapa lektion (med valfri fil)
    @PostMapping("/course/{courseId}")
    public Lesson createLesson(
            @PathVariable Long courseId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "videoUrl", required = false) String videoUrl,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        Course course = courseRepo.findById(courseId).orElseThrow();

        Lesson lesson = new Lesson();
        lesson.setTitle(title);
        lesson.setContent(content);
        lesson.setVideoUrl(videoUrl);
        lesson.setCourse(course);

        // Sätt sist i ordningen
        List<Lesson> existing = lessonRepo.findByCourseIdOrderBySortOrderAsc(courseId);
        lesson.setSortOrder(existing.size() + 1);

        if (file != null && !file.isEmpty()) {
            String path = fileService.storeFile(file);
            lesson.setAttachmentUrl(path);
            lesson.setAttachmentName(file.getOriginalFilename());
        }

        return lessonRepo.save(lesson);
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
            String path = fileService.storeFile(file);
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