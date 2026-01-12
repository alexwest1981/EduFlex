package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "course_evaluation_responses")
public class CourseEvaluationResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "evaluation_id")
    private CourseEvaluation evaluation;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    private LocalDateTime submittedAt;

    @ElementCollection
    @CollectionTable(name = "evaluation_answers", joinColumns = @JoinColumn(name = "response_id"))
    @MapKeyColumn(name = "question_index")
    @Column(name = "answer_data", length = 1000) // Storing JSON string or simple text
    private Map<Integer, String> answers;

    public CourseEvaluationResponse() {
    }

    public CourseEvaluationResponse(Long id, CourseEvaluation evaluation, User student, LocalDateTime submittedAt,
            Map<Integer, String> answers) {
        this.id = id;
        this.evaluation = evaluation;
        this.student = student;
        this.submittedAt = submittedAt;
        this.answers = answers;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CourseEvaluation getEvaluation() {
        return evaluation;
    }

    public void setEvaluation(CourseEvaluation evaluation) {
        this.evaluation = evaluation;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Map<Integer, String> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<Integer, String> answers) {
        this.answers = answers;
    }
}
