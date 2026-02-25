package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Arkiverad rapport – sparas automatiskt varje gång en CSN-rapport genereras i JSON-format.
 * Innehåller fullständig data som JSON-text för att kunna återvisas utan ny generering.
 * XML- och Excel-rapporter lagras utan datainnehåll (bara metadata) eftersom de laddas ned direkt.
 */
@Entity
@Table(name = "generated_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Visningsnamn, t.ex. "CSN Rapport — Matematik, Svenska (2 kurser)" */
    @Column(nullable = false)
    private String title;

    /** Typ av rapport: "CSN" */
    @Column(nullable = false)
    private String reportType;

    /** Exportformat: "JSON", "XML" eller "EXCEL" */
    @Column(nullable = false)
    private String format;

    /** Utbildningstyp för XML-rapporter: KOMVUX, YH, HOGSKOLA */
    private String educationType;

    /** Rapportperiod start */
    private String periodStart;

    /** Rapportperiod slut */
    private String periodEnd;

    /** Antal elev-rader i rapporten */
    private int rowCount;

    /** Användare som genererade rapporten */
    private String generatedBy;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    /**
     * Fullständig JSON-data för rapporten (List<CsnAttendanceDto> serialiserad).
     * Sätts bara för format=JSON. XML/Excel har null här.
     */
    @Column(columnDefinition = "TEXT")
    private String dataJson;
}
