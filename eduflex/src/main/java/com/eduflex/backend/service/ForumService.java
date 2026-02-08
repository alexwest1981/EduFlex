package com.eduflex.backend.service;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class ForumService {

    private final ForumThreadRepository threadRepository;
    private final ForumPostRepository postRepository;
    private final ForumCategoryRepository categoryRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final GamificationService gamificationService;
    private final SimpMessagingTemplate messagingTemplate;

    private final ForumReactionRepository reactionRepository;
    private final com.eduflex.backend.service.ai.GeminiService geminiService;
    private final com.eduflex.backend.edugame.repository.EduGameProfileRepository eduGameProfileRepository;

    public ForumService(ForumThreadRepository threadRepository, ForumPostRepository postRepository,
            ForumCategoryRepository categoryRepository, CourseRepository courseRepository,
            UserRepository userRepository, GamificationService gamificationService,
            SimpMessagingTemplate messagingTemplate, ForumReactionRepository reactionRepository,
            com.eduflex.backend.service.ai.GeminiService geminiService,
            com.eduflex.backend.edugame.repository.EduGameProfileRepository eduGameProfileRepository) {
        this.threadRepository = threadRepository;
        this.postRepository = postRepository;
        this.categoryRepository = categoryRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.gamificationService = gamificationService;
        this.messagingTemplate = messagingTemplate;
        this.reactionRepository = reactionRepository;
        this.geminiService = geminiService;
        this.eduGameProfileRepository = eduGameProfileRepository;
    }

    @Transactional
    public ForumThread createThread(Long categoryId, Long userId, String title, String content) {
        // AI Moderation
        checkContentSafety(title + "\n" + content);

        ForumCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ForumThread thread = new ForumThread();
        thread.setCourse(category.getCourse());
        thread.setCategory(category);
        thread.setAuthor(author);
        thread.setTitle(title);
        thread.setContent(content);

        ForumThread savedThread = threadRepository.save(thread);

        // Gamification
        gamificationService.addPoints(userId, 20);
        updateForumRank(userId, 20);

        // Real-time broadcast: New Thread in Course
        // Payload can be the full thread or a summary
        messagingTemplate.convertAndSend("/topic/course/" + category.getCourse().getId() + "/forum", savedThread);

        return savedThread;
    }

    @Transactional
    public ForumPost replyToThread(Long threadId, Long userId, String content) {
        // AI Moderation
        checkContentSafety(content);

        ForumThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ForumPost post = new ForumPost();
        post.setThread(thread);
        post.setAuthor(author);
        post.setContent(content);

        ForumPost savedPost = postRepository.save(post);

        // Gamification
        gamificationService.addPoints(userId, 10);
        updateForumRank(userId, 10);

        // Real-time broadcast: New Reply to Thread
        messagingTemplate.convertAndSend("/topic/thread/" + threadId, savedPost);

        return savedPost;
    }

    @Transactional
    public void reactToPost(Long postId, Long userId, String reactionType) {
        ForumPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if reaction already exists
        Optional<ForumReaction> existing = reactionRepository.findByPostIdAndUserId(postId, userId);

        if (existing.isPresent()) {
            ForumReaction r = existing.get();
            if (r.getType().equals(reactionType)) {
                // Toggle off if clicking same reaction
                reactionRepository.delete(r);
            } else {
                // Change reaction
                r.setType(reactionType);
                reactionRepository.save(r);
            }
        } else {
            // New reaction
            ForumReaction reaction = new ForumReaction(post, user, reactionType);
            reactionRepository.save(reaction);
            gamificationService.addPoints(userId, 1); // Small bonus for engagement
            updateForumRank(userId, 1);
        }

        // Broadcast event
        Map<String, Object> reactionEvent = new HashMap<>();
        reactionEvent.put("postId", postId);
        reactionEvent.put("userId", userId);
        reactionEvent.put("type", reactionType);

        Long threadId = post.getThread().getId();
        messagingTemplate.convertAndSend("/topic/thread/" + threadId + "/reactions", reactionEvent);
    }

    // AI FEATURES

    private void checkContentSafety(String text) {
        if (text == null || text.isBlank())
            return;
        if (!geminiService.isAvailable())
            return;

        String prompt = "Review this forum post for toxicity, hate speech, or severe spam. " +
                "Answer ONLY 'SAFE' or 'UNSAFE'.\n\nText: " + text;

        String result = geminiService.generateResponse(prompt).trim().toUpperCase();
        if (result.contains("UNSAFE")) {
            throw new RuntimeException("Content flagged by AI moderation as inappropriate.");
        }
    }

    public String summarizeThread(Long threadId) {
        ForumThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        StringBuilder sb = new StringBuilder();
        sb.append("Title: ").append(thread.getTitle()).append("\n");
        sb.append("Original Post: ").append(thread.getContent()).append("\n\n");
        sb.append("Replies:\n");

        for (ForumPost post : thread.getPosts()) {
            sb.append("- ").append(post.getAuthor().getFullName()).append(": ").append(post.getContent()).append("\n");
        }

        String prompt = "Summarize the following discussion thread into a short paragraph. Highlight the main question and the solution if present.\n\n"
                + sb.toString();

        return geminiService.generateResponse(prompt);
    }

    private void updateForumRank(Long userId, int pointsToAdd) {
        com.eduflex.backend.edugame.model.EduGameProfile profile = eduGameProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElseThrow();
                    return new com.eduflex.backend.edugame.model.EduGameProfile(user);
                });

        int newPoints = profile.getForumActivityPoints() + pointsToAdd;
        profile.setForumActivityPoints(newPoints);

        // Calculate Icon
        String icon = null;
        if (newPoints >= 5000) {
            icon = "🏛️"; // Pillar
        } else if (newPoints >= 1000) {
            icon = "📚"; // Scholar
        } else if (newPoints >= 200) {
            icon = "🌿"; // Contributor
        } else if (newPoints >= 50) {
            icon = "🌱"; // Newcomer
        }
        profile.setForumRankIcon(icon);

        eduGameProfileRepository.save(profile);
    }
}
