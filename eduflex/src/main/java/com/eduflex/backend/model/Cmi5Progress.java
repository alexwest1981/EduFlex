package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cmi5_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "cmi5_package_id", "registration" })
})
public class Cmi5Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "cmi5_package_id", nullable = false)
    private Cmi5Package cmi5Package;

    @Column(nullable = false)
    private String registration;

    private String status; // "COMPLETED", "PASSED", "FAILED", "IN_PROGRESS"

    private Double score; // Scaled score (0.0 - 1.0)

    private LocalDateTime updatedAt;

    private LocalDateTime completedAt;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public Cmi5Package getCmi5Package() {
        return cmi5Package;
    }

    public void setCmi5Package(Cmi5Package cmi5Package) {
        this.cmi5Package = cmi5Package;
    }

    public String getRegistration() {
        return registration;
    }

    public void setRegistration(String registration) {
        this.registration = registration;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
