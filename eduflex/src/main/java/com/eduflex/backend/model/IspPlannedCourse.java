package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * En planerad kurs inom en Individuell Studieplan (ISP).
 * Kopplas till en faktisk kurs i systemet om möjligt, annars lagras
 * kursnamn och kurskod som fritexter.
 */
@Entity
@Table(name = "isp_planned_courses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IspPlannedCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "isp_id", nullable = false)
    @JsonBackReference
    private IndividualStudyPlan isp;

    /** Valfri koppling till befintlig kurs i systemet. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    /** Kursnamn — alltid ifyllt (kan komma från Course eller manuellt). */
    @Column(nullable = false)
    private String courseName;

    private String courseCode;

    @Builder.Default
    private Integer studyPacePct = 100;

    private LocalDate plannedStart;
    private LocalDate plannedEnd;

    /** Poäng för kursen. */
    private Integer points;

    /** Nivå (t.ex. Gymnasial, Grundläggande). */
    private String level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CourseStatus status = CourseStatus.PLANNED;

    public enum CourseStatus {
        PLANNED,
        IN_PROGRESS,
        COMPLETED,
        DROPPED
    }
}
