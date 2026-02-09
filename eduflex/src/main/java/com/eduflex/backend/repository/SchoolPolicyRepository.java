package com.eduflex.backend.repository;

import com.eduflex.backend.model.SchoolPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SchoolPolicyRepository extends JpaRepository<SchoolPolicy, Long> {
}
