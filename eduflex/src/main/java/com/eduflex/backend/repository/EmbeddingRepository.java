package com.eduflex.backend.repository;

import com.eduflex.backend.model.VectorStoreEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmbeddingRepository extends JpaRepository<VectorStoreEntry, Long> {

    // Fetch all embeddings for a specific course to perform in-memory similarity
    // search
    List<VectorStoreEntry> findByCourseId(Long courseId);

    List<VectorStoreEntry> findBySourceTypeAndSourceId(String sourceType, Long sourceId);

    List<VectorStoreEntry> findBySourceType(String sourceType);

    void deleteBySourceTypeAndSourceId(String sourceType, Long sourceId);
}
