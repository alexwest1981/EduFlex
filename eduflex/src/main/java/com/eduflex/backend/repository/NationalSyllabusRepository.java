package com.eduflex.backend.repository;

import com.eduflex.backend.model.NationalSyllabus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface NationalSyllabusRepository extends JpaRepository<NationalSyllabus, UUID> {
    Optional<NationalSyllabus> findByCode(String code);
}
