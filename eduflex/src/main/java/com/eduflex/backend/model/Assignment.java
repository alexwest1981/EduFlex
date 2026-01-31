package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Assignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 5000)
    private String description;

    private LocalDateTime dueDate;

    @ManyToOne(optional = true)
    @JoinColumn(name = "course_id", nullable = true)
    @JsonIgnore
    private Course course;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<AssignmentAttachment> attachments = new java.util.ArrayList<>();

    // Gamification fields
    @Column(name = "xp_reward")
    private Integer xpReward = 100;

    @Column(name = "xp_multiplier")
    private Double xpMultiplier = 1.0;

    @Column(name = "time_bonus_minutes")
    private Integer timeBonusMinutes;

    @Column(name = "time_bonus_xp")
    private Integer timeBonusXp;

    @Column(name = "show_on_leaderboard")
    private Boolean showOnLeaderboard = false;

    @Column(name = "achievement_id")
    private Long achievementId;

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

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public java.util.List<AssignmentAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(java.util.List<AssignmentAttachment> attachments) {
        this.attachments = attachments;
    }

    // Gamification getters and setters
    public Integer getXpReward() {
        return xpReward;
    }

    public void setXpReward(Integer xpReward) {
        this.xpReward = xpReward;
    }

    public Double getXpMultiplier() {
        return xpMultiplier;
    }

    public void setXpMultiplier(Double xpMultiplier) {
        this.xpMultiplier = xpMultiplier;
    }

    public Integer getTimeBonusMinutes() {
        return timeBonusMinutes;
    }

    public void setTimeBonusMinutes(Integer timeBonusMinutes) {
        this.timeBonusMinutes = timeBonusMinutes;
    }

    public Integer getTimeBonusXp() {
        return timeBonusXp;
    }

    public void setTimeBonusXp(Integer timeBonusXp) {
        this.timeBonusXp = timeBonusXp;
    }

    public Boolean getShowOnLeaderboard() {
        return showOnLeaderboard;
    }

    public void setShowOnLeaderboard(Boolean showOnLeaderboard) {
        this.showOnLeaderboard = showOnLeaderboard;
    }

    public Long getAchievementId() {
        return achievementId;
    }

    public void setAchievementId(Long achievementId) {
        this.achievementId = achievementId;
    }
}