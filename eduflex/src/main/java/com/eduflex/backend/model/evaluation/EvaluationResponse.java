package com.eduflex.backend.model.evaluation;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "evaluation_responses_v2")
public class EvaluationResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instance_id", nullable = false)
    private EvaluationInstance instance;

    private String studentIdHash;
    private LocalDateTime submittedAt;

    @OneToMany(mappedBy = "response", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EvaluationAnswer> answers = new ArrayList<>();

    public EvaluationResponse() {
    }

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EvaluationInstance getInstance() {
        return instance;
    }

    public void setInstance(EvaluationInstance instance) {
        this.instance = instance;
    }

    public String getStudentIdHash() {
        return studentIdHash;
    }

    public void setStudentIdHash(String studentIdHash) {
        this.studentIdHash = studentIdHash;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public List<EvaluationAnswer> getAnswers() {
        return answers;
    }

    public void setAnswers(List<EvaluationAnswer> answers) {
        this.answers = answers;
    }
}
