package com.eduflex.backend.model;

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
    // VIKTIGT: Förhindrar oändlig loop vid JSON-serialisering
    @JsonIgnoreProperties({"courses", "password", "hibernateLazyInitializer", "handler"})
    private User teacher;

    @ManyToMany
    @JoinTable(
            name = "course_students",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    // VIKTIGT: Förhindrar oändlig loop här också
    @JsonIgnoreProperties({"courses", "password", "hibernateLazyInitializer", "handler"})
    private List<User> students = new ArrayList<>();
}