package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "xapi_statements")
public class XApiStatement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String rawStatement;

    @Column(nullable = false)
    private LocalDateTime storedAt;

    public XApiStatement() {
        this.storedAt = LocalDateTime.now();
    }

    public XApiStatement(String rawStatement) {
        this();
        this.rawStatement = rawStatement;
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRawStatement() {
        return rawStatement;
    }

    public void setRawStatement(String rawStatement) {
        this.rawStatement = rawStatement;
    }

    public LocalDateTime getStoredAt() {
        return storedAt;
    }

    public void setStoredAt(LocalDateTime storedAt) {
        this.storedAt = storedAt;
    }
}
