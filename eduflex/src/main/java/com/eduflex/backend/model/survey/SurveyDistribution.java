package com.eduflex.backend.model.survey;

import com.eduflex.backend.model.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "survey_distributions")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class SurveyDistribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "template_id", nullable = false)
    private SurveyTemplate template;

    @Column(nullable = false)
    private String targetRole;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private DistributionStatus status = DistributionStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sent_by_id")
    @JsonIgnoreProperties({ "password", "classGroup", "staffStatus" })
    private User sentBy;

    private LocalDateTime sentAt;
    private LocalDateTime deadline;
    private LocalDateTime createdAt;

    public enum DistributionStatus {
        DRAFT, ACTIVE, CLOSED
    }

    public SurveyDistribution() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SurveyTemplate getTemplate() {
        return template;
    }

    public void setTemplate(SurveyTemplate template) {
        this.template = template;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public DistributionStatus getStatus() {
        return status;
    }

    public void setStatus(DistributionStatus status) {
        this.status = status;
    }

    public User getSentBy() {
        return sentBy;
    }

    public void setSentBy(User sentBy) {
        this.sentBy = sentBy;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
