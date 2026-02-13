package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_risk_flags")
@Data
public class StudentRiskFlag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskLevel riskLevel;

    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String aiReasoning;

    @Column(columnDefinition = "TEXT")
    private String aiSuggestions;

    @Column(name = "last_calculated")
    private LocalDateTime lastCalculated = LocalDateTime.now();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum RiskLevel {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}
