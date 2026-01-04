package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonFormat; // <--- NY IMPORT
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String fileType;
    private String fileUrl;
    private Long size;

    // FIX: Tvinga datumet att bli en sträng som React förstår
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime uploadedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User owner;

    public Document() {}

    public Document(String fileName, String fileType, String fileUrl, Long size, User owner) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileUrl = fileUrl;
        this.size = size;
        this.owner = owner;
        this.uploadedAt = LocalDateTime.now();
    }

    // Getters
    public Long getId() { return id; }
    public String getFileName() { return fileName; }
    public String getFileType() { return fileType; }
    public String getFileUrl() { return fileUrl; }
    public Long getSize() { return size; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public User getOwner() { return owner; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public void setSize(Long size) { this.size = size; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    public void setOwner(User owner) { this.owner = owner; }
}