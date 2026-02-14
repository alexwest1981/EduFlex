package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_audit_logs")
@Data
@NoArgsConstructor
public class AiAuditRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionType actionType;

    private String modelUsed;
    private String promptHash;

    @Column(columnDefinition = "TEXT")
    private String inputContext;

    @Column(columnDefinition = "TEXT")
    private String outputResult;

    @Column(columnDefinition = "TEXT")
    private String reasoningTrace;

    @Column(name = "audit_metadata", columnDefinition = "TEXT")
    private String auditMetadata;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum ActionType {
        ADAPTIVE_ANALYSIS,
        CONTENT_GENERATION,
        QUIZ_GENERATION,
        CHAT_INTERACTION
    }
}
