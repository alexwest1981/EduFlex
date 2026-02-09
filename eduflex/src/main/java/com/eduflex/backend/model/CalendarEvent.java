package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "calendar_events")
public class CalendarEvent {

    public enum EventType {
        LESSON, MEETING, WORKSHOP, EXAM, ASSIGNMENT, OTHER
    }

    public enum EventStatus {
        PENDING, CONFIRMED, CANCELLED
    }

    public enum EventPlatform {
        ZOOM, TEAMS, MEETS, NONE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    private EventType type;

    @Enumerated(EnumType.STRING)
    private EventStatus status = EventStatus.CONFIRMED; // Default to CONFIRMED for now

    @Enumerated(EnumType.STRING)
    private EventPlatform platform = EventPlatform.NONE;

    private String meetingLink;
    private Boolean isMandatory = false;
    private String topic;
    private Boolean isUnmanned = false; // NYTT: För Mission Control (obemannad lektion)

    // Optional: Event related to a course
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = true)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Course course;

    // Optional: The creator/owner of the event (especially for personal slots)
    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = true)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private User owner;

    // Collaborative: People involved in this event (e.g. meeting participants)
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "calendar_event_attendees", joinColumns = @JoinColumn(name = "event_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> attendees = new HashSet<>();

    // Getters & Setters
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

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public EventType getType() {
        return type;
    }

    public void setType(EventType type) {
        this.type = type;
    }

    public EventStatus getStatus() {
        return status;
    }

    public void setStatus(EventStatus status) {
        this.status = status;
    }

    public EventPlatform getPlatform() {
        return platform;
    }

    public void setPlatform(EventPlatform platform) {
        this.platform = platform;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public Boolean getIsMandatory() {
        return isMandatory;
    }

    public void setIsMandatory(Boolean mandatory) {
        isMandatory = mandatory;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public Set<User> getAttendees() {
        return attendees;
    }

    public void setAttendees(Set<User> attendees) {
        this.attendees = attendees;
    }

    public Boolean getIsUnmanned() {
        return isUnmanned;
    }

    public void setIsUnmanned(Boolean unmanned) {
        isUnmanned = unmanned;
    }
}
