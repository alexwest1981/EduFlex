package com.eduflex.backend.repository;

import com.eduflex.backend.model.UserBankIdIdentity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserBankIdIdentityRepository extends JpaRepository<UserBankIdIdentity, Long> {
    Optional<UserBankIdIdentity> findBySsnHash(String ssnHash);
}
