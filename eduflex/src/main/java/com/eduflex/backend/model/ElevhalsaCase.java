package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "elevhalsa_cases")
public class ElevhalsaCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private Category category = Category.OTHER;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel = RiskLevel.LOW;

    @Enumerated(EnumType.STRING)
    private Status status = Status.OPEN;

    @ManyToMany
    @JoinTable(name = "elevhalsa_case_team_members", joinColumns = @JoinColumn(name = "case_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private java.util.Set<User> teamMembers = new java.util.HashSet<>();

    @Column(columnDefinition = "TEXT")
    private String notes; // För samtalsämnen och interna anteckningar

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime nextMeetingAt;
    private LocalDateTime closedAt;

    public enum Status {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED
    }

    public enum Category {
        PSYKOSOCIALT, FYSISKT, ATGARDSPROGRAM, OTHER
    }

    public enum RiskLevel {
        LOW, MEDIUM, HIGH
    }

    public ElevhalsaCase() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
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

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public java.util.Set<User> getTeamMembers() {
        return teamMembers;
    }

    public void setTeamMembers(java.util.Set<User> teamMembers) {
        this.teamMembers = teamMembers;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getNextMeetingAt() {
        return nextMeetingAt;
    }

    public void setNextMeetingAt(LocalDateTime nextMeetingAt) {
        this.nextMeetingAt = nextMeetingAt;
    }

    public LocalDateTime getClosedAt() {
        return closedAt;
    }

    public void setClosedAt(LocalDateTime closedAt) {
        this.closedAt = closedAt;
    }
}
