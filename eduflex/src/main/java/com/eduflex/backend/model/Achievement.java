package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "achievements")
@Data
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "tier", nullable = false)
    private String tier; // COMMON, RARE, EPIC, LEGENDARY

    @Column(name = "category", nullable = false)
    private String category; // ACADEMIC, SPEED, CONSISTENCY, SOCIAL, EXPLORATION

    @Column(name = "xp_reward", nullable = false)
    private Integer xpReward;

    @Column(name = "unlock_criteria", columnDefinition = "TEXT")
    private String unlockCriteria; // JSON criteria

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "organization_id")
    private Long organizationId; // null for system-wide achievements

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
