package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promo_codes")
public class PromoCode implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // e.g., "SUMMER2024"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType; // PERCENTAGE or FIXED_AMOUNT

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    private LocalDateTime validFrom;

    private LocalDateTime validUntil;

    @Column(nullable = false)
    private Integer maxUses = -1; // -1 = unlimited

    @Column(nullable = false)
    private Integer currentUses = 0;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public PromoCode() {
    }

    public PromoCode(Long id, String code, DiscountType discountType, BigDecimal discountValue, LocalDateTime validFrom,
            LocalDateTime validUntil, Integer maxUses, Integer currentUses, Boolean isActive, LocalDateTime createdAt) {
        this.id = id;
        this.code = code;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.validFrom = validFrom;
        this.validUntil = validUntil;
        this.maxUses = maxUses;
        this.currentUses = currentUses;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

    public enum DiscountType {
        PERCENTAGE,
        FIXED_AMOUNT
    }

    public boolean isValid() {
        if (!isActive)
            return false;
        LocalDateTime now = LocalDateTime.now();
        if (validFrom != null && now.isBefore(validFrom))
            return false;
        if (validUntil != null && now.isAfter(validUntil))
            return false;
        if (maxUses != -1 && currentUses >= maxUses)
            return false;
        return true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public LocalDateTime getValidFrom() {
        return validFrom;
    }

    public void setValidFrom(LocalDateTime validFrom) {
        this.validFrom = validFrom;
    }

    public LocalDateTime getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(LocalDateTime validUntil) {
        this.validUntil = validUntil;
    }

    public Integer getMaxUses() {
        return maxUses;
    }

    public void setMaxUses(Integer maxUses) {
        this.maxUses = maxUses;
    }

    public Integer getCurrentUses() {
        return currentUses;
    }

    public void setCurrentUses(Integer currentUses) {
        this.currentUses = currentUses;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
