package com.eduflex.backend.model.survey;

import com.eduflex.backend.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "survey_responses",
        uniqueConstraints = @UniqueConstraint(columnNames = { "distribution_id", "respondent_id" }))
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class SurveyResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "distribution_id", nullable = false)
    @JsonIgnore
    private SurveyDistribution distribution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "respondent_id", nullable = false)
    @JsonIgnoreProperties({ "password", "classGroup", "staffStatus" })
    private User respondent;

    private LocalDateTime submittedAt;

    @OneToMany(mappedBy = "response", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SurveyAnswer> answers = new ArrayList<>();

    public SurveyResponse() {
    }

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SurveyDistribution getDistribution() {
        return distribution;
    }

    public void setDistribution(SurveyDistribution distribution) {
        this.distribution = distribution;
    }

    public User getRespondent() {
        return respondent;
    }

    public void setRespondent(User respondent) {
        this.respondent = respondent;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public List<SurveyAnswer> getAnswers() {
        return answers;
    }

    public void setAnswers(List<SurveyAnswer> answers) {
        this.answers = answers;
    }
}
