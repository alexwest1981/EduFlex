package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String courseCode;

    @Column(length = 1000)
    private String description;

    private LocalDate startDate;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    @JsonIgnoreProperties({"coursesCreated", "password", "submissions", "documents"})
    private User teacher;

    @ManyToMany
    @JoinTable(
            name = "course_students",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    @JsonIgnoreProperties({"coursesCreated", "password", "submissions", "documents"})
    private List<User> students = new ArrayList<>();

    // --- NYTT: Cascade-regler ---

    // Om kurs raderas -> Ta bort alla uppgifter (Assignments)
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Assignment> assignments = new ArrayList<>();

    // Om kurs raderas -> Ta bort allt material
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<CourseMaterial> materials = new ArrayList<>();
}