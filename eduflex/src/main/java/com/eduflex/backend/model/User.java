package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "app_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    public enum Role {
        ADMIN, TEACHER, STUDENT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private String fullName;

    @Column(nullable = false, unique = true)
    private String ssn;

    private String address;
    private String phone;

    @Column(nullable = false)
    private String email;

    @Column(length = 5)
    private String language = "sv";

    private String profilePictureUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // --- RELATIONER ---

    // Denna lista MÅSTE finnas för att dashboard ska kunna visa "Mina Kurser"
    @ManyToMany(mappedBy = "students", fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"students", "teacher"}) // STOPPAR LOOPEN HÄR
    private List<Course> courses = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Submission> submissions = new ArrayList<>();

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<UserDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Course> coursesCreated = new ArrayList<>();

    @PrePersist
    @PreUpdate
    public void updateFullName() {
        this.fullName = this.firstName + " " + this.lastName;
    }

    public Role getRole() { return role; }
}