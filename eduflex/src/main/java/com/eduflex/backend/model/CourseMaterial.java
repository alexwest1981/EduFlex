package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "course_materials")
public class CourseMaterial {

    public enum MaterialType {
        TEXT, VIDEO, FILE, LINK, LESSON, STUDY_MATERIAL, QUESTIONS, EPUB
    }

    public enum VideoStatus {
        PENDING, PROCESSING, READY, FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 5000)
    private String content;

    private String link; // För YouTube-länkar
    private String fileUrl; // För uppladdade filer/bilder
    private String fileName; // Ursprungligt filnamn för ONLYOFFICE-stöd

    // Video-specific fields
    private Integer videoDuration; // Duration in seconds
    private String thumbnailUrl; // Auto-generated or custom thumbnail
    private Long videoFileSize; // File size in bytes for progress tracking

    @Enumerated(EnumType.STRING)
    private VideoStatus videoStatus; // Processing status for uploaded videos

    @Column(length = 2000)
    private String videoChapters; // JSON array of {time: seconds, title: string}

    // NYTT: Datumstyrning
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private java.time.LocalDateTime availableFrom;

    @Enumerated(EnumType.STRING)
    private MaterialType type;

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonIgnore
    private Course course;

    public CourseMaterial() {
    }

    public CourseMaterial(Long id, String title, String content, String link, String fileUrl, MaterialType type,
            Course course) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.link = link;
        this.fileUrl = fileUrl;
        this.type = type;
        this.course = course;
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public java.time.LocalDateTime getAvailableFrom() {
        return availableFrom;
    }

    public void setAvailableFrom(java.time.LocalDateTime availableFrom) {
        this.availableFrom = availableFrom;
    }

    public MaterialType getType() {
        return type;
    }

    public void setType(MaterialType type) {
        this.type = type;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Integer getVideoDuration() {
        return videoDuration;
    }

    public void setVideoDuration(Integer videoDuration) {
        this.videoDuration = videoDuration;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public Long getVideoFileSize() {
        return videoFileSize;
    }

    public void setVideoFileSize(Long videoFileSize) {
        this.videoFileSize = videoFileSize;
    }

    public VideoStatus getVideoStatus() {
        return videoStatus;
    }

    public void setVideoStatus(VideoStatus videoStatus) {
        this.videoStatus = videoStatus;
    }

    public String getVideoChapters() {
        return videoChapters;
    }

    public void setVideoChapters(String videoChapters) {
        this.videoChapters = videoChapters;
    }
}