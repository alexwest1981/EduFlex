package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_ebook_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "ebook_id" })
})
public class UserEbookProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "ebook_id", nullable = false)
    private Ebook ebook;

    private String lastLocation; // For EPUB CFIs
    private Integer lastPage; // For PDFs
    private Double lastTimestamp; // For Audio/Video (seconds)
    private Double percentage; // Completion percentage 0-1

    private LocalDateTime updatedAt;

    public UserEbookProgress() {
        this.updatedAt = LocalDateTime.now();
    }

    public UserEbookProgress(User user, Ebook ebook) {
        this();
        this.user = user;
        this.ebook = ebook;
    }

    @PreUpdate
    @PrePersist
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

    public Ebook getEbook() {
        return ebook;
    }

    public void setEbook(Ebook ebook) {
        this.ebook = ebook;
    }

    public String getLastLocation() {
        return lastLocation;
    }

    public void setLastLocation(String lastLocation) {
        this.lastLocation = lastLocation;
    }

    public Integer getLastPage() {
        return lastPage;
    }

    public void setLastPage(Integer lastPage) {
        this.lastPage = lastPage;
    }

    public Double getLastTimestamp() {
        return lastTimestamp;
    }

    public void setLastTimestamp(Double lastTimestamp) {
        this.lastTimestamp = lastTimestamp;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
