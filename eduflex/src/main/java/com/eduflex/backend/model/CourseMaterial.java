package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "course_materials")
public class CourseMaterial {

    public enum MaterialType {
        TEXT, VIDEO, FILE, LINK, LESSON, STUDY_MATERIAL, QUESTIONS
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 5000)
    private String content;

    private String link; // För YouTube-länkar
    private String fileUrl; // För uppladdade filer/bilder

    // NYTT: Datumstyrning
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private java.time.LocalDateTime availableFrom;

    @Enumerated(EnumType.STRING)
    private MaterialType type;

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonIgnore
    private Course course;

    public CourseMaterial() {
    }

    public CourseMaterial(Long id, String title, String content, String link, String fileUrl, MaterialType type,
            Course course) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.link = link;
        this.fileUrl = fileUrl;
        this.type = type;
        this.course = course;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public java.time.LocalDateTime getAvailableFrom() {
        return availableFrom;
    }

    public void setAvailableFrom(java.time.LocalDateTime availableFrom) {
        this.availableFrom = availableFrom;
    }

    public MaterialType getType() {
        return type;
    }

    public void setType(MaterialType type) {
        this.type = type;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }
}