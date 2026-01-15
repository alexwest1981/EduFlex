package com.eduflex.backend.repository;

import com.eduflex.backend.model.OrganizationBranding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BrandingRepository extends JpaRepository<OrganizationBranding, Long> {

    Optional<OrganizationBranding> findByOrganizationKey(String organizationKey);

    boolean existsByOrganizationKey(String organizationKey);
}
