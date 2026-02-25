package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Individuell Studieplan (ISP) — lagkrav för Komvux (Skollagen 20 kap. 11 §).
 * Varje vuxenstuderande måste ha en ISP som dokumenterar mål, bakgrund,
 * studietakt och uppföljning. SYV skapar och hanterar planen; eleven kvitterar.
 */
@Entity
@Table(name = "individual_study_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IndividualStudyPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Studenten som äger denna plan. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    /** SYV (Studie- och yrkesvägledare) som skapade/ansvarar för planen. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "counselor_id", nullable = false)
    private User counselor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.DRAFT;

    /** Versionsnummer — ökar vid varje revision. */
    @Builder.Default
    private Integer version = 1;

    /** Syftet med studierna — vad studenten vill uppnå. */
    @Column(columnDefinition = "TEXT")
    private String syfte;

    /** Bakgrund — tidigare utbildning och arbetslivserfarenhet. */
    @Column(columnDefinition = "TEXT")
    private String bakgrund;

    /** Mål — konkreta studiemål och delmål. */
    @Column(columnDefinition = "TEXT")
    private String mal;

    /** Stödbehov — behov av extra stöd eller anpassningar. */
    @Column(name = "stodbehoV", columnDefinition = "TEXT")
    private String stodbehoV;

    /** Interna noteringar från SYV — ej synliga för studenten. */
    @Column(columnDefinition = "TEXT")
    private String counselorNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Studieform studieform = Studieform.PLATS;

    /** Studietakt i procent: 25, 50, 75 eller 100. */
    @Builder.Default
    private Integer studyPacePct = 100;

    private LocalDate plannedStart;
    private LocalDate plannedEnd;

    /** Examensmål (för gymnasial utbildning). */
    @Column(columnDefinition = "TEXT")
    private String examensmal;

    /** Krav på poäng för examen. */
    private Integer kravPoang;

    /** Validering / Tillgodoräknande — tidigare kurser/meriter. */
    @Column(columnDefinition = "TEXT")
    private String validering;

    /**
     * Tidpunkt då studenten bekräftade/kvitterade sin plan. Null = ej kvitterad.
     */
    private LocalDateTime studentAcknowledgedAt;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    /** Planerade kurser inom denna ISP. */
    @OneToMany(mappedBy = "isp", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @Builder.Default
    private List<IspPlannedCourse> plannedCourses = new ArrayList<>();

    // -----------------------------------------------------------------------

    public enum Status {
        DRAFT, // Utkast — under arbete av SYV
        ACTIVE, // Aktiv — godkänd och gäller
        REVISED, // Under revision — ny version håller på att skapas
        COMPLETED, // Avslutad — studenten har genomfört sina studier
        ARCHIVED // Arkiverad
    }

    public enum Studieform {
        PLATS,
        DISTANS,
        KOMBINERAD
    }
}
