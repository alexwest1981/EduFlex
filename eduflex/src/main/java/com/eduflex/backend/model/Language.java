package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "languages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Language {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code; // e.g., "en", "sv", "fr"

    @Column(nullable = false)
    private String name; // e.g., "English", "Svenska"

    private String nativeName; // e.g., "English", "Svenska"

    @Builder.Default
    @Column(columnDefinition = "boolean default true")
    private boolean isEnabled = true;

    @Builder.Default
    @Column(columnDefinition = "boolean default false")
    private boolean isDefault = false;

    private String flagIcon; // Optional emoji or icon name
}
