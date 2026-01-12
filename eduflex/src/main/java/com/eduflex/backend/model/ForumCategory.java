package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class ForumCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private boolean teacherOnly;

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonIgnoreProperties({ "students", "teacher", "evaluation" }) // Stoppar loop mot kursen
    private Course course;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // VIKTIGT: Stoppar loopen! Vi hämtar trådar via en egen endpoint.
    private List<ForumThread> threads = new ArrayList<>();

    public ForumCategory() {
    }

    public ForumCategory(String name, String description, boolean teacherOnly, Course course) {
        this.name = name;
        this.description = description;
        this.teacherOnly = teacherOnly;
        this.course = course;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isTeacherOnly() {
        return teacherOnly;
    }

    public void setTeacherOnly(boolean teacherOnly) {
        this.teacherOnly = teacherOnly;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public List<ForumThread> getThreads() {
        return threads;
    }

    public void setThreads(List<ForumThread> threads) {
        this.threads = threads;
    }
}