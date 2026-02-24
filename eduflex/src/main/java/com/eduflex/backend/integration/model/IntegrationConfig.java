package com.eduflex.backend.integration.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Gemensam modell för alla externa integrationer (LTI, Zoom, Teams, Skolverket,
 * SIS, Bibliotek).
 * Varje rad = en konfigurerad integration med status, inställningar och
 * synk-historik.
 */
@Entity
@Table(name = "integration_config")
@Data
public class IntegrationConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String platform;

    @Column(name = "display_name")
    private String displayName;

    private String description;

    @Column(name = "webhook_url", length = 1024)
    private String webhookUrl;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String settings;

    @Column(length = 30)
    private String status = "NOT_CONFIGURED";

    @Column(name = "last_sync")
    private LocalDateTime lastSync;

    @Column(name = "last_error")
    private String lastError;

    @Column(name = "error_count")
    private Integer errorCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
