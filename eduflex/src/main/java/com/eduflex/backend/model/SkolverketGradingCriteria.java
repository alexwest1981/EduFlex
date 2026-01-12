package com.eduflex.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "skolverket_grading_criteria")
public class SkolverketGradingCriteria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "skolverket_course_id", nullable = false)
    private SkolverketCourse course;

    @Column(nullable = false, length = 1)
    private String gradeLevel; // "E", "D", "C", "B", "A"

    @Column(length = 10000, nullable = false)
    private String criteriaText;

    @Column(nullable = false)
    private Integer sortOrder; // 1=E, 2=D, 3=C, 4=B, 5=A

    // Constructors
    public SkolverketGradingCriteria() {
    }

    public SkolverketGradingCriteria(SkolverketCourse course, String gradeLevel, String criteriaText,
            Integer sortOrder) {
        this.course = course;
        this.gradeLevel = gradeLevel;
        this.criteriaText = criteriaText;
        this.sortOrder = sortOrder;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SkolverketCourse getCourse() {
        return course;
    }

    public void setCourse(SkolverketCourse course) {
        this.course = course;
    }

    public String getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(String gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    public String getCriteriaText() {
        return criteriaText;
    }

    public void setCriteriaText(String criteriaText) {
        this.criteriaText = criteriaText;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
