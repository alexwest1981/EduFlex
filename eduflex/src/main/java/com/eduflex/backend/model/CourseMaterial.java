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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    // ÄNDRAT: Vi döper om till 'content' och tillåter mycket text (HTML/Markdown/Långa beskrivningar)
    @Column(length = 10000)
    private String content;

    private String link; // För externa länkar (YouTube etc)
    private String type; // "VIDEO", "LINK", "FILE", "TEXT"

    // NYTT: Filer
    private String fileName;
    private String fileUrl;
    private String fileType;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore
    private Course course;
}