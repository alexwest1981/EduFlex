package com.eduflex.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "embeddings", indexes = {
        @Index(name = "idx_embedding_course_id", columnList = "courseId"),
        @Index(name = "idx_embedding_source_type", columnList = "sourceType"),
        @Index(name = "idx_embedding_source_id", columnList = "sourceId")
})
public class VectorStoreEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column // Now nullable, as ebooks might not belong to a course
    private Long courseId;

    @Column(nullable = false)
    private String sourceType; // "MATERIAL" or "EBOOK"

    @Column(nullable = false)
    private Long sourceId; // ID of either Material or Ebook

    private String sourceTitle;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String textChunk;

    @Column(columnDefinition = "float8[]")
    private Double[] embeddingVector;

    public VectorStoreEntry() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public Long getSourceId() {
        return sourceId;
    }

    public void setSourceId(Long sourceId) {
        this.sourceId = sourceId;
    }

    public String getSourceTitle() {
        return sourceTitle;
    }

    public void setSourceTitle(String sourceTitle) {
        this.sourceTitle = sourceTitle;
    }

    public String getTextChunk() {
        return textChunk;
    }

    public void setTextChunk(String textChunk) {
        this.textChunk = textChunk;
    }

    public Double[] getEmbeddingVector() {
        return embeddingVector;
    }

    public void setEmbeddingVector(Double[] embeddingVector) {
        this.embeddingVector = embeddingVector;
    }

    // Alias for backward compatibility if needed temporarily
    public Double[] getVector() {
        return embeddingVector;
    }
}
