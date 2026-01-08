package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "course_evaluation_responses")
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    // Stores answers as a JSON-compatible map: QuestionIndex -> {score: 5, comment:
    // "Bra"}
    // In a real production app, we might use a separate table or proper JSONB type.
    // For simplicity here with JPA + H2/Postgres:
    @ElementCollection
    @CollectionTable(name = "evaluation_answers", joinColumns = @JoinColumn(name = "response_id"))
    @MapKeyColumn(name = "question_index")
    @Column(name = "answer_data", length = 1000) // Storing JSON string or simple text
    private Map<Integer, String> answers;
}
