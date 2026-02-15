package com.eduflex.backend.repository;

import com.eduflex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    java.util.List<User> findByRole_Name(String roleName);

    long countByRole(com.eduflex.backend.model.Role role);

    long countByRole_Name(String roleName);

    long countByLastLoginAfter(java.time.LocalDateTime cutoff);

    java.util.List<User> findByClassGroup_Id(Long classGroupId);

    long countByClassGroup_Id(Long classGroupId);

    long countByRole_NameAndStaffStatus(String roleName, User.StaffStatus status);

    long countByLastActiveAfter(java.time.LocalDateTime cutoff);

    // Health Check Queries
    java.util.List<User> findByClassGroupIsNullAndRole_Name(String roleName);

    // Users without email (if allowed)
    java.util.List<User> findByEmailIsNull();
}