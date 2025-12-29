package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class ForumCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private boolean teacherOnly;

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonIgnoreProperties({"students", "teacher", "evaluation"}) // Stoppar loop mot kursen
    private Course course;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // VIKTIGT: Stoppar loopen! Vi hämtar trådar via en egen endpoint.
    private List<ForumThread> threads = new ArrayList<>();

    public ForumCategory(String name, String description, boolean teacherOnly, Course course) {
        this.name = name;
        this.description = description;
        this.teacherOnly = teacherOnly;
        this.course = course;
    }
}