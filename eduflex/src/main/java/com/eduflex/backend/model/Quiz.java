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