package com.eduflex.scorm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "xapi_statements")
public class XApiStatement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String statementData;

    private String actorEmail;
    private String verbId;
    private String objectId;
    private String registration;

    private LocalDateTime storedAt;

    public XApiStatement() {
    }

    public XApiStatement(String statementData) {
        this.statementData = statementData;
    }

    @PrePersist
    protected void onCreate() {
        this.storedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStatementData() {
        return statementData;
    }

    public void setStatementData(String statementData) {
        this.statementData = statementData;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public void setActorEmail(String actorEmail) {
        this.actorEmail = actorEmail;
    }

    public String getVerbId() {
        return verbId;
    }

    public void setVerbId(String verbId) {
        this.verbId = verbId;
    }

    public String getObjectId() {
        return objectId;
    }

    public void setObjectId(String objectId) {
        this.objectId = objectId;
    }

    public String getRegistration() {
        return registration;
    }

    public void setRegistration(String registration) {
        this.registration = registration;
    }

    public LocalDateTime getStoredAt() {
        return storedAt;
    }

    public void setStoredAt(LocalDateTime storedAt) {
        this.storedAt = storedAt;
    }
}
