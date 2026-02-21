package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "business_outcomes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessOutcome {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "course_id")
    private Long courseId; // Kopplat till specifik kurs eller generellt

    @Column(name = "metric_name", nullable = false)
    private String metricName; // t.ex. "Försäljning", "CSAT", "Produktivitet"

    @Column(name = "metric_value", nullable = false)
    private Double metricValue;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @PrePersist
    protected void onCreate() {
        if (recordedAt == null) {
            recordedAt = LocalDateTime.now();
        }
    }
}
