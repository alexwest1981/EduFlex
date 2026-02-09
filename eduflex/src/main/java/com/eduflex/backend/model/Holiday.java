package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "holidays")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Holiday implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private boolean assignmentsAllowed = false; // Is this an "assignment-free" holiday?

    public Holiday() {
    }

    public Holiday(String name, LocalDate startDate, LocalDate endDate, boolean assignmentsAllowed) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.assignmentsAllowed = assignmentsAllowed;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public boolean isAssignmentsAllowed() {
        return assignmentsAllowed;
    }

    public void setAssignmentsAllowed(boolean assignmentsAllowed) {
        this.assignmentsAllowed = assignmentsAllowed;
    }
}
