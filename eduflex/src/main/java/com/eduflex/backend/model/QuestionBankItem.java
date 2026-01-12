package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;

@Entity
public class QuestionBankItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    private String category;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty; // EASY, MEDIUM, HARD

    @Enumerated(EnumType.STRING)
    private QuestionType type; // MULTIPLE_CHOICE, OPEN

    @ElementCollection
    private List<String> options = new ArrayList<>();

    // Kan vara index (int) eller text (String). Vi kör String för flexibilitet
    private String correctAnswer;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    public QuestionBankItem() {
    }

    public QuestionBankItem(Long id, String questionText, String category, Difficulty difficulty, QuestionType type,
            List<String> options, String correctAnswer, User author) {
        this.id = id;
        this.questionText = questionText;
        this.category = category;
        this.difficulty = difficulty;
        this.type = type;
        this.options = options;
        this.correctAnswer = correctAnswer;
        this.author = author;
    }

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }

    public enum QuestionType {
        MULTIPLE_CHOICE, OPEN, TRUE_FALSE
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public QuestionType getType() {
        return type;
    }

    public void setType(QuestionType type) {
        this.type = type;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }
}
