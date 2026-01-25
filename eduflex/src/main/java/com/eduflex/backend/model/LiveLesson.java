package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * LiveLesson - Represents a live video classroom session.
 * Integrates with Jitsi Meet for real-time video conferencing.
 */
@Entity
@Table(name = "live_lessons")
public class LiveLesson {

    public enum Status {
        SCHEDULED,  // Scheduled for future
        LIVE,       // Currently active
        ENDED,      // Session completed
        CANCELLED   // Cancelled by teacher
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 1000)
    private String description;

    // Unique room name for Jitsi (generated from course + timestamp)
    @Column(unique = true)
    private String roomName;

    // Direct join URL
    private String joinUrl;

    @Enumerated(EnumType.STRING)
    private Status status = Status.SCHEDULED;

    // Scheduling
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;

    // Actual times
    private LocalDateTime actualStart;
    private LocalDateTime actualEnd;

    // Related course
    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonIgnoreProperties({"students", "materials", "teacher", "evaluation"})
    private Course course;

    // Host teacher
    @ManyToOne
    @JoinColumn(name = "host_id")
    @JsonIgnoreProperties({"password", "courses", "documents"})
    private User host;

    // Settings
    private boolean recordingEnabled = false;
    private String recordingUrl; // Saved after session ends

    private boolean waitingRoomEnabled = false;
    private boolean chatEnabled = true;
    private boolean screenShareEnabled = true;

    // Participant tracking
    private Integer maxParticipants = 50;
    private Integer peakParticipants = 0;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // --- Getters & Setters ---

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

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public String getJoinUrl() {
        return joinUrl;
    }

    public void setJoinUrl(String joinUrl) {
        this.joinUrl = joinUrl;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getScheduledStart() {
        return scheduledStart;
    }

    public void setScheduledStart(LocalDateTime scheduledStart) {
        this.scheduledStart = scheduledStart;
    }

    public LocalDateTime getScheduledEnd() {
        return scheduledEnd;
    }

    public void setScheduledEnd(LocalDateTime scheduledEnd) {
        this.scheduledEnd = scheduledEnd;
    }

    public LocalDateTime getActualStart() {
        return actualStart;
    }

    public void setActualStart(LocalDateTime actualStart) {
        this.actualStart = actualStart;
    }

    public LocalDateTime getActualEnd() {
        return actualEnd;
    }

    public void setActualEnd(LocalDateTime actualEnd) {
        this.actualEnd = actualEnd;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public User getHost() {
        return host;
    }

    public void setHost(User host) {
        this.host = host;
    }

    public boolean isRecordingEnabled() {
        return recordingEnabled;
    }

    public void setRecordingEnabled(boolean recordingEnabled) {
        this.recordingEnabled = recordingEnabled;
    }

    public String getRecordingUrl() {
        return recordingUrl;
    }

    public void setRecordingUrl(String recordingUrl) {
        this.recordingUrl = recordingUrl;
    }

    public boolean isWaitingRoomEnabled() {
        return waitingRoomEnabled;
    }

    public void setWaitingRoomEnabled(boolean waitingRoomEnabled) {
        this.waitingRoomEnabled = waitingRoomEnabled;
    }

    public boolean isChatEnabled() {
        return chatEnabled;
    }

    public void setChatEnabled(boolean chatEnabled) {
        this.chatEnabled = chatEnabled;
    }

    public boolean isScreenShareEnabled() {
        return screenShareEnabled;
    }

    public void setScreenShareEnabled(boolean screenShareEnabled) {
        this.screenShareEnabled = screenShareEnabled;
    }

    public Integer getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public Integer getPeakParticipants() {
        return peakParticipants;
    }

    public void setPeakParticipants(Integer peakParticipants) {
        this.peakParticipants = peakParticipants;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
