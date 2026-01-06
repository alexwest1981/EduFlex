package com.eduflex.backend.dto;

import java.util.Set;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;

    // NYA FÄLT SOM SAKNADES
    private String firstName;
    private String lastName;
    private String fullName;
    private String role;

    private String profilePictureUrl;
    private int points;
    private int level;
    private Set<?> earnedBadges;

    // Uppdaterad konstruktor som tar emot allt
    public JwtResponse(String accessToken, Long id, String username, String firstName, String lastName, String fullName, String role,
                       String profilePictureUrl, int points, int level, Set<?> earnedBadges) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.fullName = fullName;
        this.role = role;
        this.profilePictureUrl = profilePictureUrl;
        this.points = points;
        this.level = level;
        this.earnedBadges = earnedBadges;
    }

    // Getters och Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
    public Set<?> getEarnedBadges() { return earnedBadges; }
    public void setEarnedBadges(Set<?> earnedBadges) { this.earnedBadges = earnedBadges; }
}