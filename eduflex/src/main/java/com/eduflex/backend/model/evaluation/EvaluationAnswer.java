package com.eduflex.backend.model.evaluation;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "evaluation_answers_v2")
public class EvaluationAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_id", nullable = false)
    @JsonIgnore
    private EvaluationResponse response;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private EvaluationQuestion question;

    @Column(columnDefinition = "TEXT")
    private String answerValue;

    public EvaluationAnswer() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EvaluationResponse getResponse() {
        return response;
    }

    public void setResponse(EvaluationResponse response) {
        this.response = response;
    }

    public EvaluationQuestion getQuestion() {
        return question;
    }

    public void setQuestion(EvaluationQuestion question) {
        this.question = question;
    }

    public String getAnswerValue() {
        return answerValue;
    }

    public void setAnswerValue(String answerValue) {
        this.answerValue = answerValue;
    }
}
