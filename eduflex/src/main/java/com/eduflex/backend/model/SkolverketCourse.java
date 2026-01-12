package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "skolverket_courses")
@Data
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class SkolverketCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String courseCode;

    @Column(nullable = false)
    private String courseName;

    @Column(nullable = false)
    private Integer points;

    @Column(nullable = false)
    private String subject;

    @Column(length = 2000)
    private String description; // Optional course description from Skolverket

    // Additional metadata
    private String englishTitle;
    private String skolformer; // "VUXGYM, GYAN" etc.
    private String pdfUrl; // Link to official Skolverket PDF

    // Course content
    @Column(length = 5000)
    private String subjectPurpose; // "Ämnets syfte"
    @Column(length = 5000)
    private String objectives; // Course objectives/goals

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public SkolverketCourse() {
    }

    public SkolverketCourse(String courseCode, String courseName, Integer points, String subject) {
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.points = points;
        this.subject = subject;
        this.description = null; // Will be added later if available
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getEnglishTitle() {
        return englishTitle;
    }

    public void setEnglishTitle(String englishTitle) {
        this.englishTitle = englishTitle;
    }

    public String getSkolformer() {
        return skolformer;
    }

    public void setSkolformer(String skolformer) {
        this.skolformer = skolformer;
    }

    public String getPdfUrl() {
        return pdfUrl;
    }

    public void setPdfUrl(String pdfUrl) {
        this.pdfUrl = pdfUrl;
    }

    public String getSubjectPurpose() {
        return subjectPurpose;
    }

    public void setSubjectPurpose(String subjectPurpose) {
        this.subjectPurpose = subjectPurpose;
    }

    public String getObjectives() {
        return objectives;
    }

    public void setObjectives(String objectives) {
        this.objectives = objectives;
    }
}
