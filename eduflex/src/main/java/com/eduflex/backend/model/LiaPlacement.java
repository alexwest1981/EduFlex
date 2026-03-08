package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "lia_placements")
@EntityListeners(com.eduflex.backend.service.AuditListener.class)
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class LiaPlacement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({ "courses", "coursesCreated", "password", "hibernateLazyInitializer", "handler" })
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({ "students", "hibernateLazyInitializer", "handler" })
    private Course course;

    // --- LIA Company Details ---
    private String companyName;
    private String companyOrgNumber;
    private String supervisorName;
    private String supervisorEmail;
    private String supervisorPhone;

    // --- Dates ---
    private LocalDate startDate;
    private LocalDate endDate;

    // --- COMPLIANCE FLAGS (MYH Requirements) ---
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean agreementSigned = false;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean midtermEvaluationDone = false;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean finalEvaluationDone = false;

    // --- Status ---
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LiaStatus status = LiaStatus.PLANNED;

    public enum LiaStatus {
        PLANNED, ONGOING, COMPLETED, CANCELLED
    }

    // --- Getters & Setters ---

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

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyOrgNumber() {
        return companyOrgNumber;
    }

    public void setCompanyOrgNumber(String companyOrgNumber) {
        this.companyOrgNumber = companyOrgNumber;
    }

    public String getSupervisorName() {
        return supervisorName;
    }

    public void setSupervisorName(String supervisorName) {
        this.supervisorName = supervisorName;
    }

    public String getSupervisorEmail() {
        return supervisorEmail;
    }

    public void setSupervisorEmail(String supervisorEmail) {
        this.supervisorEmail = supervisorEmail;
    }

    public String getSupervisorPhone() {
        return supervisorPhone;
    }

    public void setSupervisorPhone(String supervisorPhone) {
        this.supervisorPhone = supervisorPhone;
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

    public boolean isAgreementSigned() {
        return agreementSigned;
    }

    public void setAgreementSigned(boolean agreementSigned) {
        this.agreementSigned = agreementSigned;
    }

    public boolean isMidtermEvaluationDone() {
        return midtermEvaluationDone;
    }

    public void setMidtermEvaluationDone(boolean midtermEvaluationDone) {
        this.midtermEvaluationDone = midtermEvaluationDone;
    }

    public boolean isFinalEvaluationDone() {
        return finalEvaluationDone;
    }

    public void setFinalEvaluationDone(boolean finalEvaluationDone) {
        this.finalEvaluationDone = finalEvaluationDone;
    }

    public LiaStatus getStatus() {
        return status;
    }

    public void setStatus(LiaStatus status) {
        this.status = status;
    }
}
