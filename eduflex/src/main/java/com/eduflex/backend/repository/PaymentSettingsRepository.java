package com.eduflex.backend.repository;

import com.eduflex.backend.model.PaymentSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PaymentSettingsRepository extends JpaRepository<PaymentSettings, Long> {
    Optional<PaymentSettings> findByProvider(String provider);

    Optional<PaymentSettings> findByIsActiveTrue();
}
