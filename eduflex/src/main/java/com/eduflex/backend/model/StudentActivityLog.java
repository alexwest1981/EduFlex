package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_activity_logs")
public class StudentActivityLog {

    public enum ActivityType {
        VIEW_LESSON,
        DOWNLOAD_FILE,
        WATCH_VIDEO,
        COURSE_ACCESS,
        LOGIN,
        QUIZ_ATTEMPT,
        ASSIGNMENT_SUBMISSION,
        FORUM_POST,
        EBOOK_READ,
        AI_TUTOR_CHAT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = true)
    @JsonIgnore
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id")
    private CourseMaterial material;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType activityType;

    @Column(length = 1000)
    private String details;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public StudentActivityLog() {
    }

    public StudentActivityLog(User user, Course course, CourseMaterial material, ActivityType activityType,
            String details) {
        this.user = user;
        this.course = course;
        this.material = material;
        this.activityType = activityType;
        this.details = details;
        this.timestamp = LocalDateTime.now();
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

    public CourseMaterial getMaterial() {
        return material;
    }

    public void setMaterial(CourseMaterial material) {
        this.material = material;
    }

    public ActivityType getActivityType() {
        return activityType;
    }

    public void setActivityType(ActivityType activityType) {
        this.activityType = activityType;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
