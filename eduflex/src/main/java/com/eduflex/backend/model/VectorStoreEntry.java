package com.eduflex.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "embeddings", indexes = {
        @Index(name = "idx_embedding_course_id", columnList = "courseId"),
        @Index(name = "idx_embedding_document_id", columnList = "documentId")
})
public class VectorStoreEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private Long documentId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String textChunk;

    @Column(columnDefinition = "float8[]")
    private Double[] embeddingVector;

    public VectorStoreEntry() {
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public String getTextChunk() { return textChunk; }
    public void setTextChunk(String textChunk) { this.textChunk = textChunk; }

    public Double[] getEmbeddingVector() { return embeddingVector; }
    public void setEmbeddingVector(Double[] embeddingVector) { this.embeddingVector = embeddingVector; }

    // Alias for backward compatibility if needed temporarily
    public Double[] getVector() { return embeddingVector; }
}
