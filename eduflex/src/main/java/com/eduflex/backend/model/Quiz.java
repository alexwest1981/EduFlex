package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "quizzes")
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @ManyToOne(optional = true)
    @JoinColumn(name = "course_id", nullable = true) // Nullable för att kunna skapa resurser utan kurs
    @JsonIgnoreProperties("quizzes")
    private Course course;

    @ManyToOne
    @JoinColumn(name = "author_id") // Den som skapade quizet
    private User author;

    private java.time.LocalDateTime availableFrom;
    private java.time.LocalDateTime availableTo;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("quiz")
    private List<Question> questions;

    // Getters & Setters
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public java.time.LocalDateTime getAvailableFrom() {
        return availableFrom;
    }

    public void setAvailableFrom(java.time.LocalDateTime availableFrom) {
        this.availableFrom = availableFrom;
    }

    public java.time.LocalDateTime getAvailableTo() {
        return availableTo;
    }

    public void setAvailableTo(java.time.LocalDateTime availableTo) {
        this.availableTo = availableTo;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
        // Hjälpmetod för att sätta relationen åt andra hållet
        if (questions != null) {
            for (Question q : questions) {
                q.setQuiz(this);
            }
        }
    }
}