package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "course_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;       // T.ex. "Föreläsning 1"
    private String description; // T.ex. "Genomgång av Java basics"
    private String type;        // T.ex. "FÖRELÄSNING", "LABB", "STUDIEBESÖK"
    private LocalDateTime date; // Datum och tid

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonIgnore
    private Course course;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Attendance> attendances = new ArrayList<>();
}