package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "certifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Certification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String title;

    private String certificateUrl;

    private LocalDateTime issuedAt;

    private LocalDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    private CertificationStatus status;

    private String verifyCode;

    public enum CertificationStatus {
        ACTIVE,
        EXPIRING_SOON,
        EXPIRED,
        REVOKED
    }
}
