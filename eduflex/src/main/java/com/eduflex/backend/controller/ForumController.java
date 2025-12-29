package com.eduflex.backend.controller;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/forum")
public class ForumController {

    private final ForumThreadRepository threadRepository;
    private final ForumPostRepository postRepository;
    private final ForumCategoryRepository categoryRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public ForumController(ForumThreadRepository t, ForumPostRepository p, ForumCategoryRepository cat, CourseRepository c, UserRepository u) {
        this.threadRepository = t;
        this.postRepository = p;
        this.categoryRepository = cat;
        this.courseRepository = c;
        this.userRepository = u;
    }

    // --- KATEGORIER ---

    @GetMapping("/course/{courseId}/categories")
    public List<ForumCategory> getCategories(@PathVariable Long courseId) {
        List<ForumCategory> categories = categoryRepository.findByCourseId(courseId);

        // AUTO-INIT: Om inga kategorier finns, skapa standardstrukturen
        if (categories.isEmpty()) {
            Course course = courseRepository.findById(courseId).orElseThrow();
            // Om ingen lärare finns kopplad, sätt author till null eller hantera det
            User admin = course.getTeacher();

            // Kategori 1: Viktig Information (Låst)
            ForumCategory infoCat = new ForumCategory("Viktig information", "Regler, uppslag och kursinformation från läraren.", true, course);
            categoryRepository.save(infoCat);

            // Skapa Dummy-regler tråd
            ForumThread rulesThread = new ForumThread();
            rulesThread.setCourse(course);
            rulesThread.setCategory(infoCat);
            rulesThread.setAuthor(admin);
            rulesThread.setTitle("Forumregler & Information");
            rulesThread.setContent("Välkommen till kursforumet!\n\nHär är några enkla regler:\n1. Håll god ton.\n2. Inga personangrepp.\n3. Håll diskussionen relevant till ämnet.\n\nLycka till med studierna!");
            threadRepository.save(rulesThread);

            // Kategori 2: Allmänt (Öppen)
            ForumCategory generalCat = new ForumCategory("Allmänt", "Diskutera allt som rör kursen här.", false, course);
            categoryRepository.save(generalCat);

            // Kategori 3: Läxhjälp
            ForumCategory homeworkCat = new ForumCategory("Läxhjälp & Uppgifter", "Fastnat på en uppgift? Fråga här!", false, course);
            categoryRepository.save(homeworkCat);

            // Hämta listan igen nu när de är skapade
            categories = categoryRepository.findByCourseId(courseId);
        }

        return categories;
    }

    // NY ENDPOINT: Skapa ny kategori
    @PostMapping("/course/{courseId}/categories")
    public ResponseEntity<ForumCategory> createCategory(@PathVariable Long courseId, @RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String description = (String) payload.get("description");
        Boolean teacherOnly = (Boolean) payload.get("teacherOnly");

        Course course = courseRepository.findById(courseId).orElseThrow();

        ForumCategory category = new ForumCategory(name, description, teacherOnly, course);
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    // --- TRÅDAR ---

    @GetMapping("/category/{categoryId}/threads")
    public List<ForumThread> getThreadsByCategory(@PathVariable Long categoryId) {
        ForumCategory cat = categoryRepository.findById(categoryId).orElseThrow();
        return cat.getThreads();
    }

    // Skapa ny tråd
    @PostMapping("/category/{categoryId}/thread")
    public ResponseEntity<ForumThread> createThread(@PathVariable Long categoryId, @RequestBody Map<String, String> payload) {
        Long userId = Long.valueOf(payload.get("userId"));
        String title = payload.get("title");
        String content = payload.get("content");

        ForumCategory category = categoryRepository.findById(categoryId).orElseThrow();
        User author = userRepository.findById(userId).orElseThrow();

        ForumThread thread = new ForumThread();
        thread.setCourse(category.getCourse());
        thread.setCategory(category);
        thread.setAuthor(author);
        thread.setTitle(title);
        thread.setContent(content);

        return ResponseEntity.ok(threadRepository.save(thread));
    }

    // Svara i en tråd
    @PostMapping("/thread/{threadId}/reply")
    public ResponseEntity<ForumPost> replyToThread(@PathVariable Long threadId, @RequestBody Map<String, String> payload) {
        Long userId = Long.valueOf(payload.get("userId"));
        String content = payload.get("content");

        ForumThread thread = threadRepository.findById(threadId).orElseThrow();
        User author = userRepository.findById(userId).orElseThrow();

        ForumPost post = new ForumPost();
        post.setThread(thread);
        post.setAuthor(author);
        post.setContent(content);

        return ResponseEntity.ok(postRepository.save(post));
    }

    // NY ENDPOINT: Hämta senaste aktivitet (För Dashboard)
    @GetMapping("/recent/{userId}")
    public ResponseEntity<List<ForumThread>> getRecentActivity(@PathVariable Long userId) {
        // Enkel implementation: Hämta de 10 senaste trådarna totalt
        List<ForumThread> recentThreads = threadRepository.findAll().stream()
                .sorted((a, b) -> b.getId().compareTo(a.getId())) // Sortera på ID fallande (nyast först)
                .limit(10)
                .collect(Collectors.toList());

        return ResponseEntity.ok(recentThreads);
    }
}