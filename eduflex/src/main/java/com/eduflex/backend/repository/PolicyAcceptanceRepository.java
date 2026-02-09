package com.eduflex.backend.repository;

import com.eduflex.backend.model.PolicyAcceptance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PolicyAcceptanceRepository extends JpaRepository<PolicyAcceptance, Long> {
    Optional<PolicyAcceptance> findByPolicyIdAndUserId(Long policyId, Long userId);
}
