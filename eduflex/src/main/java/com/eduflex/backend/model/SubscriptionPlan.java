package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "subscription_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlan implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., "Free", "Basic", "Pro", "Enterprise"

    @Column(nullable = false)
    private String displayName; // e.g., "EduFlex Basic"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price; // Monthly price in SEK/USD/EUR

    @Column(nullable = false)
    private String currency = "SEK"; // SEK, USD, EUR

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillingInterval billingInterval = BillingInterval.MONTHLY;

    @Column(columnDefinition = "integer default 0")
    private Integer trialPeriodDays = 0; // Number of days for free trial

    @Column(nullable = false)
    private Integer maxUsers = -1; // -1 = unlimited

    @Column(nullable = false)
    private Integer maxCourses = -1; // -1 = unlimited

    @Column(nullable = false)
    private Integer maxStorage = -1; // in GB, -1 = unlimited

    @ElementCollection
    @CollectionTable(name = "subscription_plan_features", joinColumns = @JoinColumn(name = "plan_id"))
    @Column(name = "feature")
    private List<String> features; // e.g., "AI Quiz Generator", "Analytics Dashboard"

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Boolean isDefault = false; // Default plan for new users

    @Column(nullable = false)
    private Integer sortOrder = 0; // For display ordering

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum BillingInterval {
        MONTHLY,
        YEARLY,
        LIFETIME
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
