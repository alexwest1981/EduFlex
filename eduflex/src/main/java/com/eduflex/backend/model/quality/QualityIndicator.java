package com.eduflex.backend.model.quality;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "quality_indicators")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualityIndicator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    private QualityGoal goal;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "indicator_type", nullable = false)
    private String indicatorType; // ATTENDANCE, GRADES, INCIDENTS, SURVEY, MANUAL

    private Double targetValue;

    @Builder.Default
    private Double currentValue = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isCompleted = false;

    private String unit;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
