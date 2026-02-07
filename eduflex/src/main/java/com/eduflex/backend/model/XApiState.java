package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "xapi_states")
public class XApiState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Explicit no-args constructor for Lombok compatibility
    public XApiState() {
    }

    @Column(nullable = false)
    private String actorEmail;

    @Column(nullable = false)
    private String activityId;

    @Column(nullable = false)
    private String stateId;

    private String registration;

    @Column(columnDefinition = "TEXT")
    private String stateData;

    private LocalDateTime lastUpdated;

    // Explicit setters/getters because of potential Lombok issues during build
    public void setActorEmail(String actorEmail) {
        this.actorEmail = actorEmail;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public void setActivityId(String activityId) {
        this.activityId = activityId;
    }

    public String getActivityId() {
        return activityId;
    }

    public void setStateId(String stateId) {
        this.stateId = stateId;
    }

    public String getStateId() {
        return stateId;
    }

    public void setStateData(String stateData) {
        this.stateData = stateData;
    }

    public String getStateData() {
        return stateData;
    }

    public void setRegistration(String registration) {
        this.registration = registration;
    }

    public String getRegistration() {
        return registration;
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }

    public XApiState(String actorEmail, String activityId, String stateId, String stateData, String registration) {
        this.actorEmail = actorEmail;
        this.activityId = activityId;
        this.stateId = stateId;
        this.stateData = stateData;
        this.registration = registration;
    }
}
