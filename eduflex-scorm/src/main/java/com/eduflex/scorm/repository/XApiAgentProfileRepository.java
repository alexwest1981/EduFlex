package com.eduflex.scorm.repository;

import com.eduflex.scorm.model.XApiAgentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface XApiAgentProfileRepository extends JpaRepository<XApiAgentProfile, Long> {
    Optional<XApiAgentProfile> findByAgentIdAndProfileId(String agentId, String profileId);
}
