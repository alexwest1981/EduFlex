package com.eduflex.backend.repository;

import com.eduflex.backend.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TenantRepository extends JpaRepository<Tenant, String> {
    Optional<Tenant> findByDomain(String domain);

    Optional<Tenant> findByDbSchema(String dbSchema);
}
