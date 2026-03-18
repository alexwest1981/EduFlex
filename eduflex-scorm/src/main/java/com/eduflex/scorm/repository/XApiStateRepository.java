package com.eduflex.scorm.repository;

import com.eduflex.scorm.model.XApiState;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface XApiStateRepository extends JpaRepository<XApiState, Long> {
    Optional<XApiState> findByActorEmailAndActivityIdAndStateId(String actorEmail, String activityId, String stateId);

    Optional<XApiState> findByActorEmailAndActivityIdAndStateIdAndRegistration(String actorEmail, String activityId,
            String stateId, String registration);
}
