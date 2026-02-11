package com.eduflex.backend.repository;

import com.eduflex.backend.model.ElevhalsaCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ElevhalsaCaseRepository extends JpaRepository<ElevhalsaCase, Long> {
    long countByStatus(ElevhalsaCase.Status status);

    long countByStatusAndClosedAtAfter(ElevhalsaCase.Status status, LocalDateTime after);

    List<ElevhalsaCase> findTop10ByOrderByCreatedAtDesc();
}
