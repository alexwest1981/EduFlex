package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Gemensam modell för alla externa integrationer.
 * Varje rad = en integration (Zoom, Teams, SIS, LTI, Skolverket, Bibliotek).
 * config_json sparar integrations-specifika inställningar som JSON-sträng.
 */
@Entity
@Table(name = "integration_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntegrationConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "integration_type", unique = true, nullable = false)
    private String integrationType;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    private String description;

    @Builder.Default
    private Boolean enabled = false;

    // JSON-sträng med integrations-specifika nycklar (API keys, OAuth tokens etc.)
    @Column(name = "config_json", columnDefinition = "TEXT")
    @Builder.Default
    private String configJson = "{}";

    @Builder.Default
    private String status = "NOT_CONFIGURED";

    @Column(name = "last_sync")
    private LocalDateTime lastSync;

    @Column(name = "last_error")
    private String lastError;

    @Column(name = "error_count")
    @Builder.Default
    private Integer errorCount = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
