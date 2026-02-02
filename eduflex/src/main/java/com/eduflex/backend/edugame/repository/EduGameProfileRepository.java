package com.eduflex.backend.edugame.repository;

import com.eduflex.backend.edugame.model.EduGameProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EduGameProfileRepository extends JpaRepository<EduGameProfile, Long> {
    Optional<EduGameProfile> findByUserId(Long userId);
}
