package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_documents")
public class UserDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title; // T.ex. "Mitt CV"

    // Vi tillåter upp till 5000 tecken
    @Column(length = 5000)
    private String description;

    @Column(nullable = false)
    private String type; // T.ex. "CV", "BETYG", "LIA_BREV"

    private LocalDate uploadDate;

    // Sökväg till filen (används av frontend för att hämta/ladda ner)
    private String fileUrl;

    // --- NYA FÄLT FÖR FILUPPLADDNING ---
    private String fileName; // Originalfilnamnet (t.ex. "cv_2025.pdf")
    private String contentType; // Filtypen (t.ex. "application/pdf")

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    public UserDocument() {
    }

    public UserDocument(Long id, String title, String description, String type, LocalDate uploadDate, String fileUrl,
            String fileName, String contentType, User owner) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.type = type;
        this.uploadDate = uploadDate;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.contentType = contentType;
        this.owner = owner;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public LocalDate getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDate uploadDate) {
        this.uploadDate = uploadDate;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }
}