package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scorm_packages")
public class ScormPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String packageId; // Unique string identifier

    @Column(nullable = false)
    private String directoryPath; // e.g. "scorm/101/"

    @Column(nullable = false)
    private String launchFile; // e.g. "index.html"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    @JsonIgnoreProperties({ "scormPackages", "lessons", "students", "teacher" })
    private Course course;

    private LocalDateTime uploadedAt;

    private long sizeBytes;

    @PrePersist
    protected void onCreate() {
        this.uploadedAt = LocalDateTime.now();
    }

    public ScormPackage() {
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

    public String getPackageId() {
        return packageId;
    }

    public void setPackageId(String packageId) {
        this.packageId = packageId;
    }

    public String getDirectoryPath() {
        return directoryPath;
    }

    public void setDirectoryPath(String directoryPath) {
        this.directoryPath = directoryPath;
    }

    public String getLaunchFile() {
        return launchFile;
    }

    public void setLaunchFile(String launchFile) {
        this.launchFile = launchFile;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }
}
