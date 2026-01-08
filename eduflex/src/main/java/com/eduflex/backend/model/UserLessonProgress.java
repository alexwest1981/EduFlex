package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_lesson_progress")
public class UserLessonProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "material_id")
    private CourseMaterial material;

    private LocalDateTime viewedAt;

    public UserLessonProgress() {
    }

    public UserLessonProgress(User user, CourseMaterial material) {
        this.user = user;
        this.material = material;
        this.viewedAt = LocalDateTime.now();
    }

    // Getters & Setters
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

    public CourseMaterial getMaterial() {
        return material;
    }

    public void setMaterial(CourseMaterial material) {
        this.material = material;
    }

    public LocalDateTime getViewedAt() {
        return viewedAt;
    }

    public void setViewedAt(LocalDateTime viewedAt) {
        this.viewedAt = viewedAt;
    }
}
