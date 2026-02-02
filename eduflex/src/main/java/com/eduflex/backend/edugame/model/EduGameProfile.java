package com.eduflex.backend.edugame.model;

import com.eduflex.backend.model.User;
import jakarta.persistence.*;

@Entity
@Table(name = "edugame_profiles")
public class EduGameProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(name = "active_frame")
    private String activeFrame; // Stores itemId or resource key

    @Column(name = "active_background")
    private String activeBackground;

    @Column(name = "active_badge")
    private String activeBadge;

    @Column(name = "current_title")
    private String currentTitle;

    public EduGameProfile(User user) {
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getActiveFrame() {
        return activeFrame;
    }

    public void setActiveFrame(String activeFrame) {
        this.activeFrame = activeFrame;
    }

    public String getActiveBackground() {
        return activeBackground;
    }

    public void setActiveBackground(String activeBackground) {
        this.activeBackground = activeBackground;
    }

    public String getActiveBadge() {
        return activeBadge;
    }

    public void setActiveBadge(String activeBadge) {
        this.activeBadge = activeBadge;
    }

    public String getCurrentTitle() {
        return currentTitle;
    }

    public void setCurrentTitle(String currentTitle) {
        this.currentTitle = currentTitle;
    }
}
