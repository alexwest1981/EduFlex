package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_integrity_events")
public class ExamIntegrityEvent {

    public enum IntegrityEventType {
        FOCUS_LOST, TAB_SWITCH, FULLSCREEN_EXIT, PROCTORING_STARTED, PROCTORING_STOPPED, VIDEO_INTEGRITY_BREACH
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long quizId;
    private Long studentId;

    @Enumerated(EnumType.STRING)
    private IntegrityEventType eventType;

    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(length = 1000)
    private String details;

    @Transient
    private String studentName;

    @Transient
    private String quizTitle;

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public IntegrityEventType getEventType() {
        return eventType;
    }

    public void setEventType(IntegrityEventType eventType) {
        this.eventType = eventType;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }
}
