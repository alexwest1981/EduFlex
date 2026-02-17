package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "course_skill_mapping")
@Data
public class CourseSkillMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "contribution_weight")
    private Double contributionWeight = 1.0;

    @Column(name = "required_level")
    private Double requiredLevel = 100.0;
}
