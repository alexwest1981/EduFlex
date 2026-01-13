package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.io.Serializable;

@Entity
@Table(name = "app_users")
@EntityListeners(com.eduflex.backend.service.AuditListener.class)
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;

    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    private String phone;
    private String address;
    private String ssn;
    private String language = "sv";
    private String profilePictureUrl;

    @Column(columnDefinition = "TEXT")
    private String settings; // JSON-sträng för inställningar (språk, dashboard-widgets etc)

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(columnDefinition = "boolean default true")
    private Boolean isActive = true;

    // --- ANALYS-FÄLT ---
    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(columnDefinition = "integer default 0")
    private int loginCount = 0;

    // NYTT: För tillväxt-graf
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
    // -------------------

    // --- GAMIFICATION ---
    @Column(columnDefinition = "integer default 0")
    private int points = 0;

    @Column(columnDefinition = "integer default 1")
    private int level = 1;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<UserBadge> earnedBadges = new HashSet<>();

    // --- SUBSCRIPTION ---
    @ManyToOne
    @JoinColumn(name = "subscription_plan_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private SubscriptionPlan subscriptionPlan;

    @Column(name = "trial_ends_at")
    private LocalDateTime trialEndsAt;

    @ManyToMany(mappedBy = "students")
    @JsonIgnore
    private Set<Course> courses = new HashSet<>();

    @OneToMany(mappedBy = "teacher")
    @JsonIgnore
    private Set<Course> coursesCreated = new HashSet<>();

    // Inner Enum REMOVED - replaced by com.eduflex.backend.model.Role Entity

    // --- GETTERS & SETTERS ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getSsn() {
        return ssn;
    }

    public void setSsn(String ssn) {
        this.ssn = ssn;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getSettings() {
        return settings;
    }

    public void setSettings(String settings) {
        this.settings = settings;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }

    // Analytics
    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public int getLoginCount() {
        return loginCount;
    }

    public void setLoginCount(int loginCount) {
        this.loginCount = loginCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Gamification
    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    @JsonIgnore
    public Set<UserBadge> getEarnedBadges() {
        return earnedBadges;
    }

    public void setEarnedBadges(Set<UserBadge> earnedBadges) {
        this.earnedBadges = earnedBadges;
    }

    public SubscriptionPlan getSubscriptionPlan() {
        return subscriptionPlan;
    }

    public void setSubscriptionPlan(SubscriptionPlan subscriptionPlan) {
        this.subscriptionPlan = subscriptionPlan;
    }

    public LocalDateTime getTrialEndsAt() {
        return trialEndsAt;
    }

    public void setTrialEndsAt(LocalDateTime trialEndsAt) {
        this.trialEndsAt = trialEndsAt;
    }

    @JsonIgnore
    public Set<Course> getCourses() {
        return courses;
    }

    public void setCourses(Set<Course> courses) {
        this.courses = courses;
    }

    @JsonIgnore
    public Set<Course> getCoursesCreated() {
        return coursesCreated;
    }

    public void setCoursesCreated(Set<Course> coursesCreated) {
        this.coursesCreated = coursesCreated;
    }
}