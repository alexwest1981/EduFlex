package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class ForumThread {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 5000)
    private String content;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "author_id")
    @JsonIgnoreProperties({"courses", "documents", "submissions", "coursesCreated"})
    private User author;

    @ManyToOne
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties("threads") // Stoppar loop mot kategorin
    private ForumCategory category;

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonIgnoreProperties({"students", "teacher"})
    private Course course;

    @OneToMany(mappedBy = "thread", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("thread") // VIKTIGT: När vi visar inlägg, visa inte tråden igen inuti dem
    private List<ForumPost> posts = new ArrayList<>();
}