package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    // --- NYA FÄLT ---
    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    // Vi behåller fullName för enkelhetens skull, men den kan sättas automatiskt
    private String fullName;

    @Column(nullable = false, unique = true)
    private String ssn; // Personnummer (YYYYMMDD-XXXX)

    private String address;
    private String phone;

    @Column(nullable = false) // Unik email är ofta bra praxis
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // --- RELATIONER (Cascade för städning) ---

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Submission> submissions = new ArrayList<>();

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<UserDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Course> coursesCreated = new ArrayList<>();

    // Hjälpmetod för att sätta fullständigt namn innan vi sparar
    @PrePersist
    @PreUpdate
    public void updateFullName() {
        this.fullName = this.firstName + " " + this.lastName;
    }
}