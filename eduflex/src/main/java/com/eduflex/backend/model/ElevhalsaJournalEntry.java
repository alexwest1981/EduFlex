package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "elevhalsa_journal_entries")
public class ElevhalsaJournalEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "case_id", nullable = false)
    private ElevhalsaCase elevhalsaCase;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VisibilityLevel visibilityLevel = VisibilityLevel.INTERNAL;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum VisibilityLevel {
        INTERNAL, // Only EHT staff
        SHARED, // Staff + Student/Guardian
        PUBLIC // (Rarely used)
    }

    public ElevhalsaJournalEntry() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ElevhalsaCase getElevhalsaCase() {
        return elevhalsaCase;
    }

    public void setElevhalsaCase(ElevhalsaCase elevhalsaCase) {
        this.elevhalsaCase = elevhalsaCase;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public VisibilityLevel getVisibilityLevel() {
        return visibilityLevel;
    }

    public void setVisibilityLevel(VisibilityLevel visibilityLevel) {
        this.visibilityLevel = visibilityLevel;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
