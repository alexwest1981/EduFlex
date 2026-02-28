package com.eduflex.backend.controller;

import com.eduflex.backend.model.PromoCode;
import com.eduflex.backend.repository.PromoCodeRepository;
import com.eduflex.backend.service.PromoCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promocodes")
public class PromoCodeController {

    private final PromoCodeService promoCodeService;
    private final PromoCodeRepository promoCodeRepository;

    public PromoCodeController(PromoCodeService promoCodeService, PromoCodeRepository promoCodeRepository) {
        this.promoCodeService = promoCodeService;
        this.promoCodeRepository = promoCodeRepository;
    }

    // --- Admin Endpoints ---

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'RESELLER', 'ROLE_RESELLER')")
    public ResponseEntity<List<PromoCode>> getAllPromoCodes() {
        return ResponseEntity.ok(promoCodeRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'RESELLER', 'ROLE_RESELLER')")
    public ResponseEntity<PromoCode> createPromoCode(@RequestBody PromoCode promoCode) {
        return ResponseEntity.ok(promoCodeService.createPromoCode(promoCode));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'RESELLER', 'ROLE_RESELLER')")
    public ResponseEntity<PromoCode> updatePromoCode(@PathVariable Long id, @RequestBody PromoCode promoCode) {
        return ResponseEntity.ok(promoCodeService.updatePromoCode(id, promoCode));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'RESELLER', 'ROLE_RESELLER')")
    public ResponseEntity<Void> deletePromoCode(@PathVariable Long id) {
        promoCodeService.deletePromoCode(id);
        return ResponseEntity.noContent().build();
    }

    // --- Public/User Endpoints ---

    @PostMapping("/validate")
    public ResponseEntity<?> validatePromoCode(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        String originalPriceStr = payload.get("originalPrice");

        if (code == null) {
            return ResponseEntity.badRequest().body("Code is required");
        }

        return promoCodeService.getPromoCode(code)
                .filter(PromoCode::isValid)
                .map(promo -> {
                    BigDecimal originalPrice = originalPriceStr != null ? new BigDecimal(originalPriceStr)
                            : BigDecimal.ZERO;
                    BigDecimal discount = promoCodeService.calculateDiscount(code, originalPrice);
                    BigDecimal finalPrice = originalPrice.subtract(discount);

                    return ResponseEntity.ok(Map.of(
                            "valid", true,
                            "code", promo.getCode(),
                            "discountType", promo.getDiscountType(),
                            "discountValue", promo.getDiscountValue(),
                            "calculatedDiscount", discount,
                            "finalPrice", finalPrice));
                })
                .orElse(ResponseEntity.badRequest()
                        .body(Map.of("valid", false, "message", "Invalid or expired promo code")));
    }
}
