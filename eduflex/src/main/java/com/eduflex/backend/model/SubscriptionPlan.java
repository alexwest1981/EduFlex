package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "subscription_plans")
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

    public SubscriptionPlan() {
    }

    public SubscriptionPlan(Long id, String name, String displayName, String description, BigDecimal price,
            String currency, BillingInterval billingInterval, Integer trialPeriodDays, Integer maxUsers,
            Integer maxCourses, Integer maxStorage, List<String> features, Boolean active, Boolean isDefault,
            Integer sortOrder, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.displayName = displayName;
        this.description = description;
        this.price = price;
        this.currency = currency;
        this.billingInterval = billingInterval;
        this.trialPeriodDays = trialPeriodDays;
        this.maxUsers = maxUsers;
        this.maxCourses = maxCourses;
        this.maxStorage = maxStorage;
        this.features = features;
        this.active = active;
        this.isDefault = isDefault;
        this.sortOrder = sortOrder;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BillingInterval getBillingInterval() {
        return billingInterval;
    }

    public void setBillingInterval(BillingInterval billingInterval) {
        this.billingInterval = billingInterval;
    }

    public Integer getTrialPeriodDays() {
        return trialPeriodDays;
    }

    public void setTrialPeriodDays(Integer trialPeriodDays) {
        this.trialPeriodDays = trialPeriodDays;
    }

    public Integer getMaxUsers() {
        return maxUsers;
    }

    public void setMaxUsers(Integer maxUsers) {
        this.maxUsers = maxUsers;
    }

    public Integer getMaxCourses() {
        return maxCourses;
    }

    public void setMaxCourses(Integer maxCourses) {
        this.maxCourses = maxCourses;
    }

    public Integer getMaxStorage() {
        return maxStorage;
    }

    public void setMaxStorage(Integer maxStorage) {
        this.maxStorage = maxStorage;
    }

    public List<String> getFeatures() {
        return features;
    }

    public void setFeatures(List<String> features) {
        this.features = features;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
