package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_saved_internships")
@Data
public class SavedInternship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "job_id", nullable = false)
    private String jobId;

    private String headline;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    private String city;

    @Column(name = "match_score")
    private Double matchScore;

    @Column(name = "saved_at")
    private LocalDateTime savedAt = LocalDateTime.now();
}
