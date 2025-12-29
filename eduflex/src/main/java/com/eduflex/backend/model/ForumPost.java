package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class ForumPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 5000)
    private String content;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "author_id")
    @JsonIgnoreProperties({"courses", "documents", "submissions", "coursesCreated"})
    private User author;

    @ManyToOne
    @JoinColumn(name = "thread_id")
    @JsonIgnoreProperties("posts") // VIKTIGT: Stoppar loopen tillbaka till trådens inläggslista
    private ForumThread thread;
}