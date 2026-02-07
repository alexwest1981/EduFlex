package com.eduflex.backend.repository;

import com.eduflex.backend.model.XApiState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface XApiStateRepository extends JpaRepository<XApiState, Long> {
    Optional<XApiState> findByActorEmailAndActivityIdAndStateId(String actorEmail, String activityId, String stateId);

    Optional<XApiState> findByActorEmailAndActivityIdAndStateIdAndRegistration(String actorEmail, String activityId,
            String stateId, String registration);

    void deleteByActorEmailAndActivityIdAndStateId(String actorEmail, String activityId, String stateId);

    void deleteByActorEmailAndActivityIdAndStateIdAndRegistration(String actorEmail, String activityId, String stateId,
            String registration);
}
