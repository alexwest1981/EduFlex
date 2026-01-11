package com.eduflex.backend.controller;

import com.eduflex.backend.model.PaymentSettings;
import com.eduflex.backend.repository.PaymentSettingsRepository;
import com.eduflex.backend.service.StripeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-settings")
public class PaymentSettingsController {

    private final PaymentSettingsRepository paymentSettingsRepository;
    private final StripeService stripeService;

    public PaymentSettingsController(PaymentSettingsRepository paymentSettingsRepository,
            StripeService stripeService) {
        this.paymentSettingsRepository = paymentSettingsRepository;
        this.stripeService = stripeService;
    }

    /**
     * Get all payment settings (Admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentSettings>> getAllSettings() {
        return ResponseEntity.ok(paymentSettingsRepository.findAll());
    }

    /**
     * Get active payment settings (Public - for displaying enabled payment methods)
     */
    @GetMapping("/active")
    public ResponseEntity<PaymentSettings> getActiveSettings() {
        return paymentSettingsRepository.findByIsActiveTrue()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update payment settings (Admin only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentSettings> updateSettings(@PathVariable Long id,
            @RequestBody PaymentSettings settings) {
        return paymentSettingsRepository.findById(id)
                .map(existing -> {
                    existing.setProvider(settings.getProvider());
                    existing.setApiKey(settings.getApiKey());
                    existing.setWebhookSecret(settings.getWebhookSecret());
                    existing.setIsTestMode(settings.getIsTestMode());
                    existing.setEnabledMethods(settings.getEnabledMethods());
                    existing.setIsActive(settings.getIsActive());

                    PaymentSettings saved = paymentSettingsRepository.save(existing);

                    // Configure Stripe with new settings
                    if ("STRIPE".equals(saved.getProvider()) && saved.getIsActive()) {
                        stripeService.configure(saved.getApiKey(), saved.getWebhookSecret());
                    }

                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create payment settings (Admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentSettings> createSettings(@RequestBody PaymentSettings settings) {
        PaymentSettings saved = paymentSettingsRepository.save(settings);

        if ("STRIPE".equals(saved.getProvider()) && saved.getIsActive()) {
            stripeService.configure(saved.getApiKey(), saved.getWebhookSecret());
        }

        return ResponseEntity.ok(saved);
    }

    /**
     * Delete payment settings (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSettings(@PathVariable Long id) {
        paymentSettingsRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
