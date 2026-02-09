package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "staff_observations")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class StaffObservation implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "observer_id", nullable = false)
    private User observer; // Principal or Senior Teacher

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "observed_teacher_id", nullable = false)
    private User observedTeacher;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime observedAt = LocalDateTime.now();

    public StaffObservation() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getObserver() {
        return observer;
    }

    public void setObserver(User observer) {
        this.observer = observer;
    }

    public User getObservedTeacher() {
        return observedTeacher;
    }

    public void setObservedTeacher(User observedTeacher) {
        this.observedTeacher = observedTeacher;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getObservedAt() {
        return observedAt;
    }

    public void setObservedAt(LocalDateTime observedAt) {
        this.observedAt = observedAt;
    }
}
