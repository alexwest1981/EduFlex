package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class ForumPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 5000)
    private String content;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "author_id")
    @JsonIgnoreProperties({ "courses", "documents", "submissions", "coursesCreated" })
    private User author;

    @ManyToOne
    @JoinColumn(name = "thread_id")
    @JsonIgnoreProperties("posts") // VIKTIGT: Stoppar loopen tillbaka till trådens inläggslista
    private ForumThread thread;

    public ForumPost() {
    }

    public ForumPost(Long id, String content, LocalDateTime createdAt, User author, ForumThread thread) {
        this.id = id;
        this.content = content;
        this.createdAt = createdAt;
        this.author = author;
        this.thread = thread;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public ForumThread getThread() {
        return thread;
    }

    public void setThread(ForumThread thread) {
        this.thread = thread;
    }
}