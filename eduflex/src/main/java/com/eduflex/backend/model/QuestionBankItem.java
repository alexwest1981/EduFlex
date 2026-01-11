package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import java.util.ArrayList;

@Entity
@Data
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

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }

    public enum QuestionType {
        MULTIPLE_CHOICE, OPEN, TRUE_FALSE
    }
}
