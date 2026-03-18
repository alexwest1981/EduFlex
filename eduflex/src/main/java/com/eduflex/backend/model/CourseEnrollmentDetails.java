package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_enrollment_details")
@EntityListeners(com.eduflex.backend.service.AuditListener.class)
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class CourseEnrollmentDetails {

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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    @Column(nullable = false, columnDefinition = "integer default 100")
    private Integer studyPacePercentage = 100;

    private LocalDateTime enrolledAt;

    private LocalDateTime statusChangedAt;

    public enum EnrollmentStatus {
        NOT_STARTED, ACTIVE, DROPPED_OUT, COMPLETED
    }

    @PrePersist
    protected void onCreate() {
        if (this.enrolledAt == null) {
            this.enrolledAt = LocalDateTime.now();
        }
        if (this.statusChangedAt == null) {
            this.statusChangedAt = LocalDateTime.now();
        }
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

    public EnrollmentStatus getStatus() {
        return status;
    }

    public void setStatus(EnrollmentStatus status) {
        this.status = status;
        this.statusChangedAt = LocalDateTime.now();
    }

    public Integer getStudyPacePercentage() {
        return studyPacePercentage;
    }

    public void setStudyPacePercentage(Integer studyPacePercentage) {
        this.studyPacePercentage = studyPacePercentage;
        this.statusChangedAt = LocalDateTime.now();
    }

    public LocalDateTime getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(LocalDateTime enrolledAt) {
        this.enrolledAt = enrolledAt;
    }

    public LocalDateTime getStatusChangedAt() {
        return statusChangedAt;
    }

    public void setStatusChangedAt(LocalDateTime statusChangedAt) {
        this.statusChangedAt = statusChangedAt;
    }
}
