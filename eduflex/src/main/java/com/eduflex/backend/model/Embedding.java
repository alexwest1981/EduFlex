package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Entity
@Table(name = "embeddings", indexes = {
        @Index(name = "idx_embedding_course_id", columnList = "courseId"),
        @Index(name = "idx_embedding_document_id", columnList = "documentId")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Embedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private Long documentId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String textChunk;

    // Storing embedding as a Float array.
    // In a real pgvector setup, we would use a custom type,
    // but for MVP compatibility we store as standard array or JSON.
    // Hibernate 6 supports arrays well.
    @Column(columnDefinition = "float8[]")
    private Double[] vector;
}
