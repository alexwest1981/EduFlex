package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * AiAuditLog
 * Represents a persistent record of an AI decision or generation event.
 * Used for compliance, debugging, and explainability (XAI).
 */
@Entity
@Table(name = "ai_audit_log")
@Getter
@Setter
@NoArgsConstructor
public class AiAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String actionType; // e.g., "GENERATE_PATH", "RISK_ANALYSIS", "QUIZ_GENERATION"

    @Column(nullable = false)
    private String modelId; // e.g., "gemini-1.5-flash"

    @Column(length = 255)
    private String actorId; // Username or User ID of who triggered it

    @Column(columnDefinition = "TEXT")
    private String inputContext; // The prompt or JSON context sent to AI

    @Column(columnDefinition = "TEXT")
    private String aiResponse; // The raw or processed output from AI

    @Column(columnDefinition = "TEXT")
    private String reasoningTrace; // Optional: "Why" the AI made this decision

    @CreationTimestamp
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private boolean successful;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;
}
