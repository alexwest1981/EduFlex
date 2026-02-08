package com.eduflex.backend.repository;

import com.eduflex.backend.model.LtiLaunch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eduflex.backend.model.User;
import java.util.Optional;

@Repository
public interface LtiLaunchRepository extends JpaRepository<LtiLaunch, Long> {
    Optional<LtiLaunch> findByPlatformIssuerAndUserSubAndResourceLinkId(String platformIssuer, String userSub,
            String resourceLinkId);

    Optional<LtiLaunch> findByUserAndResourceLinkId(User user, String resourceLinkId);

    java.util.List<LtiLaunch> findByUser(User user);

    Optional<LtiLaunch> findFirstByTargetLinkUriContainingAndNrpsMembershipUrlIsNotNull(String targetLinkUriFragment);
}
