package com.eduflex.backend.repository;

import com.eduflex.backend.model.GuardianChildLink;
import com.eduflex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuardianChildLinkRepository extends JpaRepository<GuardianChildLink, Long> {
    List<GuardianChildLink> findByGuardian(User guardian);

    List<GuardianChildLink> findByStudent(User student);
}
