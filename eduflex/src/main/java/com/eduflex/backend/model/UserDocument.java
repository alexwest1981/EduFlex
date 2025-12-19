package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "user_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title; // T.ex. "Mitt CV"

    // Vi tillåter upp till 5000 tecken
    @Column(length = 5000)
    private String description;

    @Column(nullable = false)
    private String type; // T.ex. "CV", "BETYG", "LIA_BREV"

    private LocalDate uploadDate;

    // Sökväg till filen (används av frontend för att hämta/ladda ner)
    private String fileUrl;

    // --- NYA FÄLT FÖR FILUPPLADDNING ---
    private String fileName;    // Originalfilnamnet (t.ex. "cv_2025.pdf")
    private String contentType; // Filtypen (t.ex. "application/pdf")

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;
}