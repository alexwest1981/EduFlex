package com.eduflex.backend.controller;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import com.eduflex.backend.service.ForumService;
import com.eduflex.backend.service.GamificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum")
@CrossOrigin(origins = "*") // Tillåter anrop från React
public class ForumController {

    private final ForumThreadRepository threadRepository;
    private final ForumPostRepository postRepository;
    private final ForumCategoryRepository categoryRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    // Vi använder GamificationService för poäng (via Service nu)
    // private final GamificationService gamificationService; -> Flyttad till
    // Service

    private final ForumService forumService;

    // --- RÄTTAD KONSTRUKTOR ---
    public ForumController(ForumThreadRepository t, ForumPostRepository p, ForumCategoryRepository cat,
            CourseRepository c, UserRepository u, ForumService forumService) {
        this.threadRepository = t;
        this.postRepository = p;
        this.categoryRepository = cat;
        this.courseRepository = c;
        this.userRepository = u;
        this.forumService = forumService;
    }

    // --- KATEGORIER ---

    @Transactional
    @GetMapping("/course/{courseId}/categories")
    public List<ForumCategory> getCategories(@PathVariable Long courseId) {
        List<ForumCategory> categories = categoryRepository.findByCourseId(courseId);

        // Skapa default-kategorier om kursen är ny
        if (categories.isEmpty()) {
            Course course = courseRepository.findById(courseId).orElseThrow();
            // User admin = course.getTeacher(); // Ej kritiskt för auto-generering

            ForumCategory infoCat = new ForumCategory("Viktig information",
                    "Regler, uppslag och kursinformation från läraren.", true, course);
            categoryRepository.save(infoCat);

            // Skapa tråden manuellt här eller via service (vi gör det enkelt här då det är
            // init)
            ForumThread rulesThread = new ForumThread();
            rulesThread.setCourse(course);
            rulesThread.setCategory(infoCat);
            rulesThread.setAuthor(course.getTeacher());
            rulesThread.setTitle("Forumregler & Information");
            rulesThread.setContent(
                    "Välkommen till kursforumet!\n\nHär är några enkla regler:\n1. Håll god ton.\n2. Inga personangrepp.\n3. Håll diskussionen relevant till ämnet.\n\nLycka till med studierna!");
            threadRepository.save(rulesThread);

            ForumCategory generalCat = new ForumCategory("Allmänt", "Diskutera allt som rör kursen här.", false,
                    course);
            categoryRepository.save(generalCat);

            ForumCategory homeworkCat = new ForumCategory("Läxhjälp & Uppgifter", "Fastnat på en uppgift? Fråga här!",
                    false, course);
            categoryRepository.save(homeworkCat);

            categories = categoryRepository.findByCourseId(courseId);
        }
        return categories;
    }

    @PostMapping("/course/{courseId}/categories")
    public ResponseEntity<ForumCategory> createCategory(@PathVariable Long courseId,
            @RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String description = (String) payload.get("description");
        Boolean teacherOnly = (Boolean) payload.get("teacherOnly");

        Course course = courseRepository.findById(courseId).orElseThrow();

        ForumCategory category = new ForumCategory(name, description, teacherOnly, course);
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    // --- TRÅDAR ---

    @GetMapping("/category/{categoryId}/threads")
    public org.springframework.data.domain.Page<ForumThread> getThreadsByCategory(
            @PathVariable Long categoryId,
            @org.springframework.data.web.PageableDefault(size = 10) org.springframework.data.domain.Pageable pageable) {

        // Verifiera att kategorin finns (kastar error om inte)
        categoryRepository.findById(categoryId).orElseThrow();

        return threadRepository.findByCategoryIdOrderByCreatedAtDesc(categoryId, pageable);
    }

    @PostMapping("/category/{categoryId}/thread")
    public ResponseEntity<ForumThread> createThread(@PathVariable Long categoryId,
            @RequestBody Map<String, String> payload) {
        Long userId = Long.valueOf(payload.get("userId"));
        String title = payload.get("title");
        String content = payload.get("content");

        // Använd Service för logik + websocket + gamification
        ForumThread savedThread = forumService.createThread(categoryId, userId, title, content);

        return ResponseEntity.ok(savedThread);
    }

    // --- NY: SAKNADES (TA BORT TRÅD) ---
    @DeleteMapping("/thread/{id}")
    public ResponseEntity<Void> deleteThread(@PathVariable Long id) {
        threadRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // --- NY: SAKNADES (LÅS TRÅD) ---
    @PutMapping("/thread/{id}/lock")
    public ResponseEntity<?> toggleLock(@PathVariable Long id, @RequestBody Map<String, Boolean> payload) {
        ForumThread t = threadRepository.findById(id).orElseThrow();
        t.setLocked(payload.get("locked"));
        threadRepository.save(t);
        return ResponseEntity.ok().build();
    }

    // --- SVAR (POSTS) ---

    @PostMapping("/thread/{threadId}/reply")
    public ResponseEntity<ForumPost> replyToThread(@PathVariable Long threadId,
            @RequestBody Map<String, String> payload) {
        Long userId = Long.valueOf(payload.get("userId"));
        String content = payload.get("content");

        // Använd Service för logik + websocket + gamification
        ForumPost savedPost = forumService.replyToThread(threadId, userId, content);

        return ResponseEntity.ok(savedPost);
    }

    // --- NY: SAKNADES (TA BORT SVAR) ---
    @DeleteMapping("/post/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // --- REACTIONS (NYTT) ---
    @PostMapping("/post/{postId}/react")
    public ResponseEntity<Void> reactToPost(@PathVariable Long postId, @RequestBody Map<String, String> payload) {
        Long userId = Long.valueOf(payload.get("userId"));
        String reactionType = payload.get("type"); // e.g. "LIKE", "LOVE"

        forumService.reactToPost(postId, userId, reactionType);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/thread/{threadId}/summary")
    public ResponseEntity<String> summarizeThread(@PathVariable Long threadId) {
        String summary = forumService.summarizeThread(threadId);
        // Returns plain text or could be wrapped in JSON map
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/recent/{userId}")
    public ResponseEntity<List<ForumThread>> getRecentActivity(@PathVariable Long userId) {
        List<ForumThread> recentThreads = threadRepository.findTop10ByOrderByCreatedAtDesc();

        return ResponseEntity.ok(recentThreads);
    }
}