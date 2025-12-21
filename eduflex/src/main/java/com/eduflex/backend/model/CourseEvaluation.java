package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "course_evaluations")
public class CourseEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Vi använder @ElementCollection för att spara en enkel lista med strängar (frågorna)
    @ElementCollection
    @CollectionTable(name = "evaluation_questions", joinColumns = @JoinColumn(name = "evaluation_id"))
    @Column(name = "question")
    private List<String> questions;

    private boolean active = false;

    @OneToOne
    @JoinColumn(name = "course_id")
    @JsonIgnore // Förhindra oändlig loop i JSON
    private Course course;

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public List<String> getQuestions() { return questions; }
    public void setQuestions(List<String> questions) { this.questions = questions; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
}