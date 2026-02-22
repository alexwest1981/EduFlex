package com.eduflex.backend.integration.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "integration_log", indexes = {
        @Index(name = "idx_integration_log_platform", columnList = "platform"),
        @Index(name = "idx_integration_log_created_at", columnList = "created_at")
})
@Data
public class IntegrationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String platform;

    @Column(nullable = false, length = 20)
    private String direction; // "INBOUND" or "OUTBOUND"

    @Column(name = "event_type", length = 100)
    private String eventType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String payload;

    @Column(length = 50)
    private String status; // "SUCCESS", "FAILED"

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
