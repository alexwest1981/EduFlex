package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "attendance")
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private CalendarEvent event;

    @ManyToOne
    @JoinColumn(name = "student_id")
    @JsonIgnoreProperties({ "password", "courses", "documents", "submissions" })
    private User student;

    private boolean isPresent; // true = Närvarande, false = Frånvarande

    private String note; // T.ex. "Kom sent", "Giltig frånvaro"

    public Attendance() {
    }

    public Attendance(Long id, CalendarEvent event, User student, boolean isPresent, String note) {
        this.id = id;
        this.event = event;
        this.student = student;
        this.isPresent = isPresent;
        this.note = note;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CalendarEvent getEvent() {
        return event;
    }

    public void setEvent(CalendarEvent event) {
        this.event = event;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public boolean isPresent() {
        return isPresent;
    }

    public void setPresent(boolean present) {
        isPresent = present;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}