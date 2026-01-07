package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "course_materials")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseMaterial {

    public enum MaterialType {
        TEXT, VIDEO, FILE, LINK, LESSON // <--- VIKTIGT: Lade till LESSON
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 5000)
    private String content;

    private String link;
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    private MaterialType type;

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonIgnore
    private Course course;
}