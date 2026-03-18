package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "national_syllabuses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NationalSyllabus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String code; // e.g., SUN code or Skolverket course code

    private String name;

    @Column(columnDefinition = "TEXT")
    private String purpose;

    @Column(columnDefinition = "TEXT")
    private String centralContent;

    @Column(columnDefinition = "TEXT")
    private String gradingCriteria;

    private String level; // e.g., Gymnasial, Eftergymnasial, YH

    private Integer credits; // e.g., YH-poäng or Gymnasiepoäng

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
