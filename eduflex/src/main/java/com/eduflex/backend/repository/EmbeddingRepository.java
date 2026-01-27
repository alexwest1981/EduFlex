package com.eduflex.backend.repository;

import com.eduflex.backend.model.Embedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmbeddingRepository extends JpaRepository<Embedding, Long> {

    // Fetch all embeddings for a specific course to perform in-memory similarity
    // search
    List<Embedding> findByCourseId(Long courseId);

    void deleteByDocumentId(Long documentId);
}
