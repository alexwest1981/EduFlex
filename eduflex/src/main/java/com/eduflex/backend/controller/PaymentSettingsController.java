package com.eduflex.backend.controller;

import com.eduflex.backend.model.PaymentSettings;
import com.eduflex.backend.repository.PaymentSettingsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-settings")
public class PaymentSettingsController {

    private final PaymentSettingsRepository paymentSettingsRepository;

    public PaymentSettingsController(PaymentSettingsRepository paymentSettingsRepository) {
        this.paymentSettingsRepository = paymentSettingsRepository;
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
                    existing.setDomainUrl(settings.getDomainUrl());

                    PaymentSettings saved = paymentSettingsRepository.save(existing);

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
