package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class ForumThread {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 5000)
    private String content;

    private boolean locked = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "author_id")
    @JsonIgnoreProperties({ "courses", "documents", "submissions", "coursesCreated" })
    private User author;

    @ManyToOne
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties("threads") // Stoppar loop mot kategorin
    private ForumCategory category;

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonIgnoreProperties({ "students", "teacher" })
    private Course course;

    @OneToMany(mappedBy = "thread", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("thread") // VIKTIGT: När vi visar inlägg, visa inte tråden igen inuti dem
    private List<ForumPost> posts = new ArrayList<>();

    public ForumThread() {
    }

    public ForumThread(Long id, String title, String content, boolean locked, LocalDateTime createdAt, User author,
            ForumCategory category, Course course, List<ForumPost> posts) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.locked = locked;
        this.createdAt = createdAt;
        this.author = author;
        this.category = category;
        this.course = course;
        this.posts = posts;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isLocked() {
        return locked;
    }

    public void setLocked(boolean locked) {
        this.locked = locked;
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

    public ForumCategory getCategory() {
        return category;
    }

    public void setCategory(ForumCategory category) {
        this.category = category;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public List<ForumPost> getPosts() {
        return posts;
    }

    public void setPosts(List<ForumPost> posts) {
        this.posts = posts;
    }
}