package com.eduflex.backend.repository;

import com.eduflex.backend.model.LtiPlatform;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LtiPlatformRepository extends JpaRepository<LtiPlatform, Long> {
    Optional<LtiPlatform> findByIssuer(String issuer);

    Optional<LtiPlatform> findByIssuerAndClientId(String issuer, String clientId);
}
