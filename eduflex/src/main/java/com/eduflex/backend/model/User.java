package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty; // VIKTIGT: Denna import behövdes
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "app_users")
public class User {

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

    // FIX: Byt @JsonIgnore mot detta.
    // Det gör att lösenordet kan skrivas (vid registrering) men inte läsas (vid hämtning).
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(columnDefinition = "boolean default true")
    private Boolean isActive = true;

    // --- GAMIFICATION FIELDS ---
    @Column(columnDefinition = "integer default 0")
    private int points = 0;

    @Column(columnDefinition = "integer default 1")
    private int level = 1;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("user")
    private Set<UserBadge> earnedBadges = new HashSet<>();
    // ---------------------------

    @ManyToMany(mappedBy = "students")
    @JsonIgnoreProperties("students")
    private Set<Course> courses = new HashSet<>();

    @OneToMany(mappedBy = "teacher")
    @JsonIgnoreProperties("teacher")
    private Set<Course> coursesCreated = new HashSet<>();

    public enum Role { STUDENT, TEACHER, ADMIN }

    // --- GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getFullName() { return firstName + " " + lastName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getSsn() { return ssn; }
    public void setSsn(String ssn) { this.ssn = ssn; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Boolean getIsActive() { return isActive; }
    public boolean isActive() { return isActive != null && isActive; }
    public void setActive(Boolean active) { isActive = active; }

    // Gamification Getters/Setters
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
    public Set<UserBadge> getEarnedBadges() { return earnedBadges; }
    public void setEarnedBadges(Set<UserBadge> earnedBadges) { this.earnedBadges = earnedBadges; }

    public Set<Course> getCourses() { return courses; }
    public void setCourses(Set<Course> courses) { this.courses = courses; }
    public Set<Course> getCoursesCreated() { return coursesCreated; }
    public void setCoursesCreated(Set<Course> coursesCreated) { this.coursesCreated = coursesCreated; }
}