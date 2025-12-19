package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "app_users") // 'user' är ofta ett reserverat ord i SQL, så vi heter tabellen app_users
@Data // Lombok genererar Getters, Setters, toString, etc. automatiskt
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username; // T.ex. email eller användarnamn

    @Column(nullable = false)
    private String password; // Detta kommer sparas krypterat (BCrypt) senare

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // STUDENT, TEACHER eller ADMIN

    // Relationer
    // En lärare kan ha skapat många kurser, en elev kan gå många kurser
    // Vi hanterar detta i Course-klassen för att undvika cirkulära beroenden i JSON just nu,
    // men vi kan lägga till @OneToMany här senare om vi behöver hämta "alla kurser en elev går".
}
