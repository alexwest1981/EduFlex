package com.eduflex.backend.repository;

import com.eduflex.backend.model.ElevhalsaJournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ElevhalsaJournalEntryRepository extends JpaRepository<ElevhalsaJournalEntry, Long> {
    List<ElevhalsaJournalEntry> findByElevhalsaCaseIdOrderByCreatedAtAsc(Long caseId);
}
