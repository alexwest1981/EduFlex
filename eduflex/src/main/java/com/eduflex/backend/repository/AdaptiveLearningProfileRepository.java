package com.eduflex.backend.repository;

import com.eduflex.backend.model.AdaptiveLearningProfile;
import com.eduflex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdaptiveLearningProfileRepository extends JpaRepository<AdaptiveLearningProfile, Long> {
    Optional<AdaptiveLearningProfile> findByUser(User user);

    Optional<AdaptiveLearningProfile> findByUserId(Long userId);
}
