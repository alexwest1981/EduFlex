package com.eduflex.backend.service;

import com.eduflex.backend.model.Invoice;
import com.eduflex.backend.model.PromoCode;
import com.eduflex.backend.repository.PromoCodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
public class PromoCodeService {

    private final PromoCodeRepository promoCodeRepository;

    public PromoCodeService(PromoCodeRepository promoCodeRepository) {
        this.promoCodeRepository = promoCodeRepository;
    }

    public PromoCode createPromoCode(PromoCode promoCode) {
        if (promoCodeRepository.existsByCode(promoCode.getCode())) {
            throw new IllegalArgumentException("Promo code already exists: " + promoCode.getCode());
        }
        return promoCodeRepository.save(promoCode);
    }

    public PromoCode updatePromoCode(Long id, PromoCode updated) {
        return promoCodeRepository.findById(id).map(existing -> {
            existing.setCode(updated.getCode());
            existing.setDiscountType(updated.getDiscountType());
            existing.setDiscountValue(updated.getDiscountValue());
            existing.setValidFrom(updated.getValidFrom());
            existing.setValidUntil(updated.getValidUntil());
            existing.setMaxUses(updated.getMaxUses());
            existing.setIsActive(updated.getIsActive());
            return promoCodeRepository.save(existing);
        }).orElseThrow(() -> new IllegalArgumentException("Promo code not found"));
    }

    public void deletePromoCode(Long id) {
        promoCodeRepository.deleteById(id);
    }

    public Optional<PromoCode> getPromoCode(String code) {
        return promoCodeRepository.findByCode(code);
    }

    @Transactional
    public BigDecimal calculateDiscount(String code, BigDecimal originalAmount) {
        return promoCodeRepository.findByCode(code)
                .filter(PromoCode::isValid)
                .map(promo -> {
                    BigDecimal discount = BigDecimal.ZERO;
                    if (promo.getDiscountType() == PromoCode.DiscountType.PERCENTAGE) {
                        discount = originalAmount.multiply(promo.getDiscountValue())
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                    } else {
                        discount = promo.getDiscountValue();
                    }

                    // Don't discount more than the original amount
                    if (discount.compareTo(originalAmount) > 0) {
                        return originalAmount;
                    }
                    return discount;
                })
                .orElse(BigDecimal.ZERO);
    }

    @Transactional
    public void recordUsage(String code) {
        promoCodeRepository.findByCode(code).ifPresent(promo -> {
            promo.setCurrentUses(promo.getCurrentUses() + 1);
            promoCodeRepository.save(promo);
        });
    }
}
