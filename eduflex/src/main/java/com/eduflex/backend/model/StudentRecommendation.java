package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_recommendations")
public class StudentRecommendation {

    public enum RecommendationType {
        TIP, SUMMARY, ENCOURAGEMENT, REMINDER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // Optional: Can verify if recommendation is tied to a specific lesson
    private Long lessonId;
    private String lessonTitle;

    @Enumerated(EnumType.STRING)
    private RecommendationType type;

    @Column(length = 2000)
    private String content;

    private boolean isViewed;

    private LocalDateTime createdAt;

    public StudentRecommendation() {
        this.createdAt = LocalDateTime.now();
        this.isViewed = false;
    }

    public StudentRecommendation(User user, Course course, RecommendationType type, String content) {
        this.user = user;
        this.course = course;
        this.type = type;
        this.content = content;
        this.createdAt = LocalDateTime.now();
        this.isViewed = false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public void setLessonId(Long lessonId) {
        this.lessonId = lessonId;
    }

    public String getLessonTitle() {
        return lessonTitle;
    }

    public void setLessonTitle(String lessonTitle) {
        this.lessonTitle = lessonTitle;
    }

    public RecommendationType getType() {
        return type;
    }

    public void setType(RecommendationType type) {
        this.type = type;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isViewed() {
        return isViewed;
    }

    public void setViewed(boolean viewed) {
        isViewed = viewed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
