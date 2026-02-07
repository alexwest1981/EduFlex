package com.eduflex.backend.repository;

import com.eduflex.backend.model.XApiAgentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface XApiAgentProfileRepository extends JpaRepository<XApiAgentProfile, Long> {
    Optional<XApiAgentProfile> findByAgentIdAndProfileId(String agentId, String profileId);

    void deleteByAgentIdAndProfileId(String agentId, String profileId);
}
