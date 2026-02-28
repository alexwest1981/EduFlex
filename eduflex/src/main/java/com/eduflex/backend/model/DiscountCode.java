package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "discount_codes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private Double discountPercent; // e.g., 20.0 for 20%

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private Integer maxUses;

    @Column(nullable = false)
    @Builder.Default
    private Integer currentUses = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    private Long tenantId; // Optional: restrict to a specific tenant
}
