package com.eduflex.backend.repository;

import com.eduflex.backend.model.SavedInternship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SavedInternshipRepository extends JpaRepository<SavedInternship, Long> {
    List<SavedInternship> findByUserIdOrderBySavedAtDesc(Long userId);

    Optional<SavedInternship> findByUserIdAndJobId(Long userId, String jobId);

    void deleteByUserIdAndJobId(Long userId, String jobId);
}
